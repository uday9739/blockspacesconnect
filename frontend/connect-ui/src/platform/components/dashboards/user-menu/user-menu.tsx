export {}
// import { observer } from "mobx-react-lite";
// import Link from "next/link";
// import { useRouter } from "next/router";
// import { useEffect, useMemo, useRef, useState } from "react";
// import { useUserStore } from "@platform/api";
// import { OptionDots, Settings, LogOut, HelpDesk } from "@icons"
// import { DropdownDots, DropdownUserName, SummaryIcon, SummaryLabel, SummaryOption, UserBubble, UserDropdown, UserName, UserOption, UserOptionIcon, UserOptionLabel, UserOptions, UserSettings, UserSummary } from "./styles/user-menu.styles";

// export const UserMenu = observer(() =>
// {
//   const userDropdown = useRef<HTMLDivElement>();
//   const [ showUserDropdown, setShowUserDropdown ] = useState(false);
//   const router = useRouter();
//   const userStore = useUserStore();

//   const closeDropdown = useMemo(() => (
//     (e: MouseEvent & { target: HTMLElement; }) => ((
//       userDropdown.current && (
//         e.target !== userDropdown.current
//         && !userDropdown.current.contains(e.target)
//       )) ? setShowUserDropdown(false) : false)
//   ), [userDropdown.current]);

//   const doLogout = async () => {
//     await userStore.logout();
//     router.push("/auth");
//   }

//   useEffect(() => {
//     setShowUserDropdown(false);
//   }, [router.asPath]);

//   useEffect(() =>
//   {
//     showUserDropdown
//       ? document.addEventListener('mousedown', closeDropdown)
//       : document.removeEventListener('mousedown', closeDropdown);
//     return () => { document.removeEventListener('mousedown', closeDropdown); }
//   }, [ showUserDropdown ]);



//   if (!userStore.isLoggedIn) return <></>;


//   return (<><UserSettings onClick={ () => setShowUserDropdown(true) }>
//     <UserName>
//       { userStore.user.firstName[ 0 ] + userStore.user.lastName[ 0 ] }
//     </UserName>
//     <DropdownDots>
//       <OptionDots />
//     </DropdownDots>
//     <UserDropdown ref={ userDropdown } data-visible={ showUserDropdown }>
//       <DropdownUserName>
//         { `${ userStore.user.firstName } ${ userStore.user.lastName }` }
//       </DropdownUserName>
//       <UserSummary>
//         <Link
//           passHref
//           href={ {
//             pathname: router.pathname,
//             query: { ...router.query, modal: 'profile' },
//           } }
//         >
//           <SummaryOption>
//             <SummaryIcon>
//               <Settings />
//             </SummaryIcon>
//             <SummaryLabel>
//               SETTINGS
//             </SummaryLabel>
//           </SummaryOption>
//         </Link>
//         <UserBubble>
//           { userStore.user.firstName[ 0 ] + userStore.user.lastName[ 0 ] }
//         </UserBubble>
//         <SummaryOption onClick={ doLogout }>
//           <SummaryIcon>
//             <LogOut />
//           </SummaryIcon>
//           <SummaryLabel>
//             LOG OUT
//           </SummaryLabel>
//         </SummaryOption>
//       </UserSummary>
//       <UserOptions>
//         <Link passHref href="mailto:support@blockspaces.com?subject=BlockSpaces%20support%20request">
//           <UserOption>
//             <UserOptionIcon>
//               <HelpDesk />
//             </UserOptionIcon>
//             <UserOptionLabel>HelpDesk</UserOptionLabel>
//           </UserOption>
//         </Link>
//       </UserOptions>
//     </UserDropdown>
//   </UserSettings>
//   </>)
// })