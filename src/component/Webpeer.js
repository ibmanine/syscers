import { CLOSING, CLOSING } from "ws"

class Webpeer{
    constructor(url){
        this.url = url
        this.peer = new WebSocket(url)
    }
    on(handle, callback){
        this.peer.onmessage = res => {
            const json = JSON.parse(res.data)
            if(json.on == handle)
                callback(json.data)
        }
    }
    emit(handle, data){
        if(this.peer.readyState == CLOSED || this.peer.readyState == CLOSING){
            this.peer = new WebSocket(this.url)
            this.emit(handle, data)
            return
        }
        this.peer.send(JSON.stringify({
            on: handle, data: data
        }))
    }
}

export default Webpeer