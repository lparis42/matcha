const notif_messages = {
    view: "view your profile",
    match: "match on your profile",
    like: "like your profile",
    unlike: "unliked your profile",
}

export default function NotifCard ({type}: {type: string, account: number}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                    <p className="font-medium">{notif_messages[type]}</p>
                    {/*<p className="text-xs text-muted-foreground">5 min ago</p>*/}
                </div>
            </div>
        </div>
    )
}
