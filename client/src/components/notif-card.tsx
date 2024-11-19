const notif_messages = {
    view: "view your profile",
    match: "match on your profile",
    like: "like your profile",
    unlike: "unliked your profile",
    chat: "sent you a message"
}

export default function NotifCard ({type}: {type: string, account: number}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                    <p className="font-medium">{notif_messages[type]}</p>
                </div>
            </div>
        </div>
    )
}
