import React from 'react'
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import List from "@mui/material/List";

export default function BasicMenu(props: {
    items: Array<{text: string, value: any}>,
    selected: {text: string, value: any},
    onItemSelect: (data: {text: string, value: any}) => void
}) {
    const selected = props.selected || {};
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    return (
        <div>
            <List
                component="nav"
                sx={{ bgcolor: 'background.paper' }}
            ><ListItemButton onClick={handleClick}>
                    <ListItemText primary={selected.text || ""}/>
                </ListItemButton>
            </List>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                {props.items.map(item => {
                    return <MenuItem key={item.text} selected={selected.value === item.value}
                        onClick={() => {
                            props.onItemSelect(item);
                            handleClose()
                        }}>{item.text}</MenuItem>
                })}
            </Menu>
        </div>
    );
}