# Existence Game Server
Network models listing.

| P2PTrade | Fields | Description |
| :--- | :--- | :--- |
| NETMSG_REQUEST_P2P_TRADE | playerName:string | Client<>=>Server comm. Client is asking to trade with 'playerName'. Server will ask 'playerName' to trade. |
| NETMSG_REJECT_P2P_TRADE | playerName:string | Client<=>Server comm. Client informs server to reject the trade. Server confirms cancellation with original requester, 'playerName'. |
|  | | |