export default function NotifCard ({type, account}: {type: string, account: number}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                    <p className="font-medium">Machin à vu votre profil</p>
                    <p className="text-xs text-muted-foreground">5 min ago</p>
                </div>
            </div>
        </div>
    )
}
