import React, { useEffect, useState } from "react";
import Button from '@mui/material/Button';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Stack, Alert } from "@mui/material";

import io from "socket.io-client";

export default function Dialogue(){
    const ENDPOINT = "http://127.0.0.1:4002";
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        console.log("dans useeffect dialogue setting socket");
        setSocket(io(ENDPOINT));
        return () => io(ENDPOINT).close();
    }, []);

    const root = {
        flex:1,
        width: "100%",
        display: "flex",
        flexDirection: "column",
    };
    const blocStack = {
        margin: "5px",
        padding:"10px",
        flex: "1",
        overflow:"auto",
        border:"solid"
    };
    const blocInfo = {
        flex: "1",
        display:"flex",
        flexDirection:"column",
        alignItems:"stretch",
        alignContent:"stretch",
        padding:"10px",
    };

    const [open, setOpen] = React.useState(false);
    const [actionRequested, setActionRequested] = React.useState(false);
    const [stack, setStack] = React.useState([]);
    const [action, setAction] = React.useState({});


    const handleClose = () => {
        setOpen(false);
    };

    const handleMoreStack = () => {
        setActionRequested(false);
        socket.emit("Stack", action);
    };

    const handleActionRequested = () => {
        setOpen(true);
    };

    useEffect(() => {
    if(socket){
        socket.on("connect", () => {
            console.log("socket id dialogue", socket.id); // "G5p5..."
        });
        socket.on("AlertSeq", (a) => {
            setAction(a);
        });
        socket.on("StackGestion", (a) => {
            setStack(a);
        });
        socket.on("ActionReqHandling", (a) => {
            setActionRequested(a);
        });
        socket.on("RetrieveActionToExecute", (a) => {
            setAction(a);
        });
        // CLEAN UP THE EFFECT
        return () => socket.disconnect();
        }
      }, [socket]);

      useEffect(() => {
          if(actionRequested == true){
            handleActionRequested();
          }
      }, [actionRequested]);
    
    return(
        <div style={root}>
            <div style={blocStack}>
                <Stack
                    direction="column"
                    justifyContent="flex-start"
                    alignItems="stretch"
                    spacing={1}
                >
                    {stack.map((item, id) => {
                        return(  
                            <Alert severity="success">Action {id} - {item["description"]}</Alert>   
                        );
                    })}

                </Stack>
            </div>
            {!actionRequested ?
            <div style={blocInfo}>
                <Alert severity="info">Aucune Action demandée pour le moment</Alert>
                
            </div> 
            : 
            <div style={blocInfo}>
                
                <Alert severity="warning">Action demandée - {action["description"]}</Alert>
                <Button onClick={handleMoreStack}>
                    Valider
                </Button>
                
            </div>
            }
            <Dialog
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                    {"Action Utilisateur"}
                    </DialogTitle>
                    <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Une action utilisateur est demandée !
                        La séquence ne continuera pas tant qu'elle ne sera pas validée.
                    </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={handleClose} autoFocus>
                        Ok ! 
                    </Button>
                    </DialogActions>
                </Dialog>
        </div>
    );
}