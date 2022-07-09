class Webpeer{
    constructor(url){
        this.peer = new WebSocket(url)
        this.ping = this.ping()
    }
    on(handle, callback){
        this.peer.onmessage = res => {
            const json = JSON.parse(res.data)
            if(json.on == handle)
                callback(json.data)
        }
    }
    emit(handle, data){
        this.peer.send(JSON.stringify({
            on: handle, data: data
        }))
    }
    ping(){
        var interv = setInterval(() => this.peer.ping(), 28000)
    }
}

export default Webpeer