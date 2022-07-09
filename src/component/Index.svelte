<script>
	import Webpeer from "./Webpeer"

	if(!localStorage.getItem("passkey")) location.href = "/profile"

	const client = new Webpeer('wss://syscers-dapp.herokuapp.com')

	var createkey = null
	var jsenc = null
	var cjs = null

	const cmd5 = [
		(text) => {
			return cjs.SHA1(text).toString().substring(0,14)
		},
		(text) => {
			return cjs.SHA1(text).toString().substring(14,28)
		},
		(text) => {
			return cjs.SHA1(text).toString().substring(28,40)
		}
	]

	var chatsloaded = false
	var chats = []
	var msg = ""

	var toaddress = ""
	var passkey = ""
	var key = {}

	var menushow = "hide"
	var friends = ["newperson"]
	var selected = "newperson"
	var comchats = []

	

	var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

	var open = indexedDB.open("database", 1);

	open.onupgradeneeded = () => {
		var db = open.result;
		var store = db.createObjectStore("chats", {keyPath: "id"});
		store.createIndex("index", "data");
	};

	open.onsuccess = () => {
		var db = open.result;
		var tx = db.transaction("chats", "readwrite");
		var store = tx.objectStore("chats");

		var get = store.getAll();

		get.onsuccess = function() {
			for(var data of get.result){
				chats.push(data.data)
				chats = chats
			}
			chatsloaded = true
		};
	}



	function friend(){
		for(var v of chats){
			if(!friends.includes(v.from) && v.from != key.pub){
				friends.push(v.from)
				friends = friends
			}
			if(!friends.includes(v.to) && v.to != key.pub){
				friends.push(v.to)
				friends = friends
			}
		}
	}

	function compress(){
		comchats = []
		for(var v of chats){
			if(v.from == selected && v.to == key.pub){
				var newv = {
					from: "other",
					data: v.data
				}
				comchats.push(newv)
				comchats = comchats
			}
			if(v.from == key.pub && v.to == selected){
				var newv = {
					from: "you",
					data: v.data
				}
				comchats.push(newv)
				comchats = comchats
			}
		}
	}

	function selcpeople(pren){
		selected = pren
		compress()
		menushow = "hide"
	}



	function load1() {
		createkey = new JSEncrypt({ default_key_size: 144 })
		jsenc = new JSEncrypt()

		passkey = window.localStorage.getItem("passkey")

		key = stringtokey(passkey)
		console.log(key)

		var check = setInterval(() => {
			if(chatsloaded) friend()
			else clearInterval(check)
		}, 100);
	}

	function load2() {
		cjs = CryptoJS
	}



	function stringtokey(stringkey){
		var str = ""
		try{ str = window.atob(stringkey) }
		catch{ return }
		
		return {
			pub: str.split("@")[0],
			priv: str.split("@")[1]
		}
	}

	const compub = {
		co: (pub) => {
			var getbegin = (text) => {
				if(text == "QAwGgI"){
					return "0"
				}
				else return "1"
			}
			var getend = (text) => {
				if(text == "IDAQAB"){
					return "0"
				}
				else return "1"
			}

			var newpub = pub.substring(2,3)
			newpub += getbegin(pub.substring(25,31))
			newpub += pub.substring(31,58)
			newpub += getend(pub.substring(58,64))
			return newpub
		},
		ex: (newpub) => {
			var getbegin = (text) => {
				if(text == "0"){
					return "QAwGgI"
				}
				else return "AAwGQI"
			}
			var getend = (text) => {
				if(text == "0"){
					return "IDAQAB"
				}
				else return "MBAAE="
			}

			var depub = "MC"+newpub.substring(0,1)
			depub += "wDQYJKoZIhvcNAQEBBQADH"+getbegin(newpub.substring(1,2))
			depub += newpub.substring(2,29)+getend(newpub.substring(29,30))
			return depub
		}
	}



	function storedb(data){
		var db = open.result;
		var tx = db.transaction("chats", "readwrite");
		var store = tx.objectStore("chats");

		var allKeys = store.getAllKeys()

		allKeys.onsuccess = () => {
			if(allKeys.result.length > 0)
				store.add({ id: allKeys.result[allKeys.result.length-1]+1, data: data})
			else
				store.add({ id: 0, data: data})
		}
	}
	


	client.on("chat", res => {
		console.log("signal")
		if(!res.to && !res.data && !res.salt && !res.signature) return
		else if(res.from == key.pub) return
		else if(res.to != key.pub) return

		var verify = jsenc
		verify.setPublicKey(compub.ex(res.from))

		var verified = true
		for(var i = 0; i < 3; i++) if(!verify.verify(res.data, res.signature[i], cmd5[i])) verified = false
		if(!verified) return

		var decsalt = ""

		var decrypt = jsenc;
		decrypt.setPrivateKey(key.priv);
		for(var i = 0; i < 3; i++){
			if(decrypt.decrypt(res.salt[i]))
				decsalt += decrypt.decrypt(res.salt[i]);
		}

		if(decsalt.length != 15) return

		console.log(res)
		var decmsg = cjs.AES.decrypt(res.data, decsalt).toString(cjs.enc.Utf8)

		if(decmsg == "") return

		var data = {
			from: res.from,
			to: res.to,
			data: decmsg
		}

		chats.push(data)
		chats = chats

		friend()

		if(selected == res.from){
			var newi = {
				from: "other",
				data: decmsg
			}
			comchats.push(newi)
			comchats = comchats
		}

		storedb(data)
	})

	function sent(){
		if(!selected || !toaddress) return
		else if(!key.pub || !key.priv) return
		else if(msg == "") return

		var receiver = selected == "newperson" ? toaddress : selected

		var salt = ""
		var encsalt = []

		var encrypt = jsenc;
		encrypt.setPublicKey(compub.ex(receiver));

		for(var i = 0; i < 3; i++){
			var rand = Math.floor((Math.random()*30000000)+2000000).toString(36)
			salt += rand
			encsalt.push(encrypt.encrypt(rand))
		}

		var encmsg = cjs.AES.encrypt(msg, salt).toString()

		var sign = jsenc
		sign.setPrivateKey(key.priv);
		var signature = []
		
		for(var i = 0; i < 3; i++) signature.push(sign.sign(encmsg, cmd5[i]))

		var data = {
			from: key.pub,
			to: receiver,
			data: msg
		}
		var datasent = {
			from: key.pub,
			to: receiver,
			data: encmsg,
			salt: encsalt,
			signature: signature
		}
		console.log(datasent)

		client.emit("chat", datasent)
		
		chats.push(data)
		chats = chats

		friend()
		selected = receiver

		var newi = {
			from: "you",
			data: msg
		}
		comchats.push(newi)
		comchats = comchats

		storedb(data)

		msg = ""
	}
</script>
<svelte:head>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/jsencrypt/3.2.1/jsencrypt.min.js" on:load={load1}></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js" on:load={load2}></script>
</svelte:head>

<main>
	<div class="dropdown">
		<div class="dropbtn" on:click={() => {
			menushow = menushow == "show" ? "hide" : "show"
			}}>
			<div class="title-name">{selected}</div>
		</div>
		<div class="button-down" on:click={() => location.href = "/profile"}>
			<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="white" class="bi bi-caret-down-fill" viewBox="0 0 16 16">
				<path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
			</svg>
		</div>

		<div class={"dropdown-content "+menushow}>
			{ #each friends as pren }
			{ #if pren == "newperson" }
			<div><input on:focus={() => { selected = pren }} bind:value={toaddress} placeholder="new address" /></div>
			{ :else }
			<div on:click={() => selcpeople(pren)}>{pren}</div>
			{ /if }
			{ /each }
		</div>
	</div>
	<div class="chats">
		{ #each comchats as chat }
		<div class={"bubble "+chat.from}>{chat.data}</div>
		{ /each }
	</div>
	<input class="input" bind:value={msg} placeholder="message" />
	<button class="submit" on:click={sent}>Sent</button>
</main>

<style>
	main {
		background: #3C8384;
		width: 600px;
		height: calc(100vh - 3em);
		text-align: left;
		margin: 16px auto;
		box-shadow: 0px 0px 12px #aab;
		overflow: hidden;
		border-radius: 12px;
	}

	.dropbtn {
		height: 50px;
		width: calc(100% - 70px);
		color: white;
		font-size: 16px;
		cursor: pointer;
		position: relative;
		display: inline-block;
	}

	.title-name{
		font-size: 18px;
		font-weight: bold;
		position: relative;
		left: 24px;
		top: -10px;
	}

	.button-down{
		width: 50px;
		height: 50px;
		position: relative;
		display: inline-block;
        cursor: pointer;
	}

	.button-down svg{
		margin-top: 10px;
		margin-left: 18px;
	}

	.dropdown {
		height: 50px;
		width: 100%;
		background: #3C8384;
		position: relative;
		display: inline-block;
	}

	.dropdown-content {
		position: absolute;
		background-color: #fff;
		width: 400px;
		box-shadow: 0px 0px 12px #aab;
		border-radius: 8px;
		z-index: 1;
	}

	.dropdown-content div {
		color: black;
		padding: 12px 16px;
		text-decoration: none;
		display: block;
		cursor: pointer;
	}

	.dropdown-content div:hover {background-color: #dde;}

	.show {display: block;}
	.hide {display: none}

	.chats{
		background: #fff;
		width: calc(100% - 80px);
		height: calc(100% - 160px);
		border: 1px solid #3C8384;
		overflow-y: scroll;
		padding: 30px 40px;
	}

	.bubble {
		width: fit-content;
		max-width: 440px;
      	margin-top: 8px;
      	padding: 8px 16px;
      	background: #fff;
      	border: 1px solid #dde;
      	border-radius: 8px;
		overflow-wrap: break-word;
		letter-spacing: 1px;
	}

	.you {
		margin-left: auto;
		border: 1px solid #3C8384;
	}

	.input {
		width: calc(100% - 120px);
		margin: 7px 16px;
		border: none;
		border-radius: 8px;
	}

	.submit {
		background: #fff;
		border: none;
		border-radius: 8px;
		color: #1F3051;
		padding: 0.4em 16px;
	}

	.submit:hover {
		background: #1F3051;
		color: #fff;
	}

	/* h1 {
		color: #3C8384;
		text-transform: uppercase;
		font-weight: bold;
	} */

	@media (max-width: 640px) {
		main {
			width: 100vw;
            height: 100vh;
            margin: 0;
            border-radius: 0;
		}
	}
</style>