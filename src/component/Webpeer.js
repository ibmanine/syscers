class Webpeer{
    constructor(url){
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
        this.peer.send(JSON.stringify({
            on: handle, data: data
        }))
    }
}

export default Webpeer