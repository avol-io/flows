![](coverage/badge-lines.svg) ![](coverage/badge-functions.svg)

TODO
suggerire per il caso A->B->A che A prima gestisce i flussi se è un ricevente e poi quelli di ritorno per A chiamante. O uso la proprietà STATUS per sapere se uno di quelli che ho fatto partire io e done.

A -> il nome del flusso, l'endpoint ricevete. Sa che se tornerà da lui con stutus ERROR o DONE lo dovrà gestire.
A-> va (flusso1) a B -> C e ci va ad A per andare ad A il flusso 1 è wip mentre riceverà un nuovo flusso per lui compatibile e sa che deve gestrie il flusso partita da C e non il flusso 1.


A->getAuto B->nuova Auto C -> persona A -> getAuto B -> prende l'ultimo sistema a stack quando esiste già uno flusso non chiuso.