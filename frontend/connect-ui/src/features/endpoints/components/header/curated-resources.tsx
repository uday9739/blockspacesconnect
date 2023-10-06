import React, { useState } from 'react';
import { styled, alpha } from '@mui/material/styles';
import { Button, Menu, MenuItem, MenuProps } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { NetworkCuratedResources } from '@blockspaces/shared/models/network-catalog';
import Resources from './curated-resources.styles';

export type CuratedResourceProps = {
  resources:NetworkCuratedResources
}

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color:
      theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
  },
}));

export const CuratedResources = ({
  resources
}:CuratedResourceProps)=> {

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  /** caching the tooltips content */
  // const tooltipContent = useMemo( ()=> <div style={ { display: "grid", color: "#000",gridTemplateColumns: "auto auto", gridTemplateRows: "1.25rem 1.25rem", justifyItems: "end", alignItems: "center", fontSize: "1rem" } }>
  //   <p>staked:</p>
  //   <p style={{ padding: "0.3rem", justifySelf: "flex-start"}}>{ Intl.NumberFormat("en-US").format(Math.floor(stakedUserFleet)) }</p>
  //   <p>unstaked:</p> <p style={{padding: "0.3rem", justifySelf: 'flex-start'}}>{ Intl.NumberFormat("en-US").format(Math.floor(unstakedUserFleet)) }</p>
  // </div>, [stakedUserFleet, unstakedUserFleet]);

  return (
    <Resources>
      <Button
        id="demo-customized-button"
        aria-controls={open ? 'demo-customized-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant="contained"
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
        Resources
      </Button>
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          'aria-labelledby': 'demo-customized-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {
          resources && resources.resources.map((resource,idx) => {
            return(
              <MenuItem key={idx} onClick={handleClose} disableRipple>
                <a href={resource.url} target={"_blank"} style={{textDecoration:"none", color:"#000000"}}> {resource.category} - {resource.type}</a>
              </MenuItem>
            )
          })
        }
      </StyledMenu>
    </Resources>
  )
};
