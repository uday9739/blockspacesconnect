import { NextPage } from "next"
import { ReactElement, ReactNode } from "react"

/**
 * The base properties for Next.js pages within the Blockspsaces app.
 * Specific pages should typically extend this interface when defining their own custom props.
 *
 */
export default interface BasePageProps {

  /** if true, the page should allow access to users that are not logged in  */
  allowAnonymousAccess?: boolean
}

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}