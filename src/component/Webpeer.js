class Webpeer{
    constructor(url){
        this.url = url
        this.peer = new WebSocket(url)
    }
    on(handle, callback){
        console.log("on "+this.peer.readyState)
        if(this.peer.readyState == WebSocket.CLOSED){
            this.peer = new WebSocket(this.url)
            setTimeout(() => this.on(handle, callback), 1000)
            return
        }
        else if(this.peer.readyState != WebSocket.OPEN){
            setTimeout(() => this.on(handle, callback), 1000)
            return
        }else{
            setTimeout(() => this.on(handle, callback), 1000)
            this.peer.onmessage = res => {
                const json = JSON.parse(res.data)
                if(json.on == handle)
                    callback(json.data)
            }
            return
        }
    }
    emit(handle, data){
        console.log("emit "+this.peer.readyState)
        if(this.peer.readyState == WebSocket.CLOSING){
            setTimeout(() => this.emit(handle, data), 1000)
            return
        }else if(this.peer.readyState == WebSocket.CLOSED){
            this.peer = new WebSocket(this.url)
            this.emit(handle, data)
            return
        }else if(this.peer.readyState == WebSocket.CONNECTING){
            setTimeout(() => this.emit(handle, data), 1000)
            return
        }
        this.peer.send(JSON.stringify({
            on: handle, data: data
        }))
    }
}

export default Webpeer