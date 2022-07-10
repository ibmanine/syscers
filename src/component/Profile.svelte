<script>
    var createkey = null

    var passkey = {
        pub: "",
        priv: ""
    }

    var stringkey = localStorage.getItem("passkey") || ""
    var textkey = ""

    // "NDBUQUltWERZZ0YwUUNoRGdwbGxZS3ZYU1VJZXcwQE1Ha0NBUUFDRXdDSmx3MklCZEVBb1E0S1paV0NyMTBsQ0hzQ0F3RUFBUUlTWW5HMG1jMW5sQ2FtM1pOektNQmEKSThSUkFnb0E1NzZuNHNZUHpndTVBZ29BbC8yZ1JMRVV3ZGZUQWdrRC9EUlk0djBNbHdrQ0NIRmx5UzEyOFFXdgpBZ2toQ2lIa1liSXhMRlk9Ci0tLQ=="
    
    function load(){
		createkey = new JSEncrypt({ default_key_size: 144 })

        if(stringkey) passkey = stringtokey(stringkey)
    }

    const compubco = (pub) => {
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

    function submit(){
        var keyparse = stringtokey(textkey)
        if(keyparse){
            if(!keyparse.pub && !keyparse.priv) return
            else if(keyparse.pub.length != 30 && keyparse.priv.length != 150) return
            else{
                localStorage.setItem("passkey", stringkey)
                passkey = keyparse
            }
        }
    } 

    function makekey(){
        stringkey = generatestring()
        passkey = stringtokey(stringkey)
        localStorage.setItem("passkey", stringkey)
    }

    function generatestring(){
        var inkey = {
            pub: createkey.getPublicKey(),
            priv: createkey.getPrivateKey()
        };
        console.log(inkey)

        var newpub = compubco(inkey.pub.substr(27, 64))

        return window.btoa(newpub+"@"+decodeURIComponent(inkey.priv.substr(32, 150)))
    }
</script>
<svelte:head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jsencrypt/3.2.1/jsencrypt.min.js" on:load={load}></script>
</svelte:head>
<main>
	<div class="dropdown">
		<div class="dropbtn">
			<div class="title-name">Profile</div>
		</div>
		<div class="button-down" on:click={() => location.href = "/"}>
			<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="white" class="bi bi-caret-down-fill" viewBox="0 0 16 16">
				<path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
			</svg>
		</div>
	</div>
    <h2>Your Address</h2>
    String key:<br>
    <input type="text" value={stringkey} disabled><br>
    Public key:<br>
    <input type="text" value={passkey.pub} disabled><br>
    Private key:<br>
    <input type="text" value={passkey.priv} disabled><br>
    <h2>New in Here?</h2>
    <button on:click={makekey}>Create Key</button><br>
    Or<br>
    <input type="text" bind:value={textkey} placeholder="put string key"><br>
    <button on:click={submit}>Submit</button><br>
    <br>
    And then click triangle button on top right
    <br>
</main>

<style>
	main {
		background: #3C8384;
		width: 600px;
		height: calc(100vh - 3em);
		text-align: left;
		margin: 16px auto 0px auto;
		box-shadow: 0px 0px 12px #aab;
		overflow-y: scroll;
		border-radius: 12px;
        text-align: center;
        color: #fff;
	}

	.dropbtn {
		height: 50px;
		width: calc(100% - 70px);
		color: white;
		font-size: 16px;
		position: relative;
		display: inline-block;
	}

	.title-name{
		font-size: 20px;
		font-weight: bold;
		position: relative;
		left: 30px;
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

    input{
        background: #fff;
        color: #000;
		width: calc(100% - 120px);
		margin: 7px 16px;
		border: none;
		border-radius: 8px;
	}

    input:disabled{
        background: #ccc;
        color: #444;
    }

	button {
		background: #fff;
		border: none;
		border-radius: 8px;
		color: #1F3051;
		padding: 0.4em 16px;
	}

	button:hover {
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
        input{
            width: calc(100% - 60px);
        }
	}
</style>