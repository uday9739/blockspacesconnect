import React, { useState, useContext, useCallback } from 'react';
import { ThemeProvider } from 'styled-components'
import { ThemeActionsContext, StateContextProps, ActionsContextProps } from './.archive/_context'

function THEME_PROVIDER({ children }){

  const [themes] = useState<StateContextProps>([
    {
      name:'light',
      appBG:'#202246',
      appBorder:'#f1fcff',
      sidebarBG:'#343859',
      sidebarBorder:'#25163D',  // #323656 Changed for Lightning Demo
      sidebarDivider:'#1E0F37', // #2e3253 Changed for Lightning Demo
      sidebarFont:'#FFFFFF',
      contentBG:'#25163D',  // #2f3152 Changed for Lightning Demo
      primaryBG:'#FFFFFF',
      secondaryBG:'#fafbfb',
      componentBG:'#FFFFFF',
      secondaryComponentBG:'#fcfeff',
      headerBG:'#f9f9fd',
      canvasBG:'#f9f9fd',
      faintBorder:'#f9f9fa',
      lightBorder:'#ecf2f5',
      mediumBorder:'#c4d1d7',
      heavyBorder:'#aebdc6',
      componentBorder:'#608499',
      canvasBorder:'#eeeef3',
      canvasBorderLight:'#f5f5f9',
      highlightBG:'#f5feff',
      highlightBGHover:'#237c87',
      highlightBorder:'#41d1ff',
      primaryColor:'#285573',
      arrowColor:'#285573',
      mappedBG:'#285573',
      mappedColor:'#FFF',
      fontColor:'#323656',
      inverseFontColor:'#FFF',
      iconFill:'#5864E6',
      iconStroke:'#285573',
      GET:'#285573',
      POST:'#fab401',
      PUT:'#fab401',
      PATCH:'#fab401',
      DELETE:'#FF5D67'
    },
    {
      // name:'dark',
      // appBG:'#202246',
      // appBorder:'#f1fcff',
      // sidebarBG:'#343859',
      // sidebarBorder:'#323656',
      // sidebarDivider:'#2e3253',
      // sidebarFont:'#FFFFFF',
      // contentBG:'#2f3152',
      // primaryBG:'#101212',
      // secondaryBG:'#101212',
      // componentBG:'#181a1b',
      // secondaryComponentBG:'#141617',
      // headerBG:'#141617',
      // canvasBG:'#f9f9fd',
      // faintBorder:'#FFFFFF05',
      // lightBorder:'#FFFFFF10',
      // mediumBorder:'#FFFFFF25',
      // heavyBorder:'#FFFFFF30',
      // componentBorder:'#608499',
      // canvasBorder:'#eeeef3',
      // canvasBorderLight:'#f5f5f9',
      // highlightBG:'#0b634844',
      // highlightBGHover:'#0b634877',
      // highlightBorder:'#0b6348',
      // primaryColor:'#00f6fe',
      // arrowColor:'#0b6348',
      // mappedBG:'#0b6348',
      // mappedColor:'#FFF',
      // fontColor:'#323656',
      // inverseFontColor:'#FFF',
      // iconFill:'#edfef9',
      // iconStroke:'#FFF',
      // GET:'#0b6348',
      // POST:'#0b6348',
      // PUT:'#fab401',
      // PATCH:'#fab401',
      // DELETE:'#fa6001'
    }
  ]);
  const [theme, setTheme] = useState(themes[0])

  const toggleTheme = () => {
    const currentThemeIndex = themes.indexOf(theme);
    if ( currentThemeIndex + 1 >= themes.length ){
      setTheme(themes[0])
    } else {
      setTheme(themes[1])
    }
  }

  const actions:ActionsContextProps = {
    toggleTheme:useCallback(toggleTheme, [theme])
  }

  return (
    <ThemeProvider theme={theme}>
      <ThemeActionsContext.Provider value={actions}>
        { children }
      </ThemeActionsContext.Provider>
    </ThemeProvider>
  )
}

export const useThemeActions = () => useContext(ThemeActionsContext)

export default THEME_PROVIDER;