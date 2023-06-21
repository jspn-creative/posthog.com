import Logo from 'components/Logo'
import { useActions, useValues } from 'kea'
import { layoutLogic } from '../../logic/layoutLogic'
import Link from 'components/Link'
import { CallToAction } from 'components/CallToAction'
import { useSearch } from 'components/Search/SearchContext'

import { App, Brightness, Chat, Search, TextWidth, User } from 'components/NewIcons'

import { Placement } from '@popperjs/core'
import React, { useEffect, useRef, useState } from 'react'
import { usePopper } from 'react-popper'
import { useLayoutData } from 'components/Layout/hooks'
import { useLocation } from '@reach/router'
import Toggle from 'components/Toggle'
import usePostHog from 'hooks/usePostHog'
import * as icons from 'components/NewIcons'
import { Menu } from '@headlessui/react'
import { Chevron } from 'components/Icons'
import { motion } from 'framer-motion'

const DarkModeToggle = () => {
    const { websiteTheme } = useValues(layoutLogic)

    const handleClick = () => {
        window.__setPreferredTheme(websiteTheme === 'light' ? 'dark' : 'light')
    }

    return (
        <button
            onClick={handleClick}
            className="group/item text-sm px-2 py-2 rounded-sm hover:bg-border dark:hover:bg-border-dark flex justify-between items-center w-full"
        >
            <div>
                <Brightness className="opacity-50 group-hover/item:opacity-75 inline-block mr-2 w-6" />
                <span>Dark mode</span>
            </div>
            <Toggle checked={websiteTheme === 'dark'} />
        </button>
    )
}

function Tooltip({
    className = '',
    children,
    content,
    tooltipClassName = '',
    placement = 'bottom',
}: {
    children: JSX.Element
    content: string | ((setOpen: React.Dispatch<React.SetStateAction<boolean>>) => React.ReactNode)
    tooltipClassName?: string
    placement?: Placement
    className?: string
}) {
    const [open, setOpen] = useState(false)
    const [referenceElement, setReferenceElement] = useState(null)
    const [popperElement, setPopperElement] = useState(null)
    const { styles, attributes } = usePopper(referenceElement, popperElement, {
        placement,
        modifiers: [
            {
                name: 'offset',
            },
        ],
    })
    const containerEl = useRef(null)

    useEffect(() => {
        function handleClick(e) {
            if (containerEl?.current && !containerEl?.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => {
            document.removeEventListener('mousedown', handleClick)
        }
    }, [containerEl])

    return (
        <span ref={containerEl} className={className}>
            <button
                ref={setReferenceElement}
                onClick={() => setOpen(!open)}
                className={`my-1 p-2 rounded hover:bg-border dark:hover:bg-border-dark ${
                    open ? 'bg-border dark:bg-border-dark' : ''
                }`}
            >
                {children}
            </button>
            {open && (
                <div
                    className="z-[10000] pt-1"
                    role="tooltip"
                    ref={setPopperElement}
                    style={styles.popper}
                    {...attributes.popper}
                >
                    <div
                        className={`rounded-md border-light dark:border-dark border overflow-hidden ${tooltipClassName}`}
                    >
                        <div
                            className={`bg-accent dark:bg-accent-dark text-primary dark:text-primary-dark text-sm z-20`}
                        >
                            {content && (typeof content === 'string' ? content : content(setOpen))}
                        </div>
                    </div>
                </div>
            )}
        </span>
    )
}

const ActiveBackground = () => {
    return (
        <span
            className={`bg-light dark:bg-dark absolute w-full h-[calc(100%+1px)] left-0 inset-0
                before:absolute before:border-r before:top-0 before:h-full before:border-light dark:before:border-dark before:w-[10px] before:rounded-br-lg before:border-b before:left-0 before:bg-accent dark:before:bg-accent-dark before:z-10
                after:absolute after:border-l after:top-0 after:h-full after:border-light dark:after:border-dark after:w-[10px] after:rounded-bl-lg after:border-b after:right-0 after:bg-accent dark:after:bg-accent-dark`}
        >
            <span className="absolute bottom-0 left-0 border-b border-bg-light dark:border-bg-dark w-full" />
        </span>
    )
}

const InternalMenuMobile = () => {
    const { internalMenu, activeInternalMenu } = useLayoutData()
    const ActiveInternalMenuIcon = activeInternalMenu?.icon && icons[activeInternalMenu.icon]

    const container = {
        hidden: { opacity: 0, height: 0 },
        shown: { opacity: 1, height: 'auto', transition: { duration: 0.2, staggerChildren: 0.025 } },
    }

    const child = {
        hidden: { opacity: -1, translateX: '-100%' },
        shown: { opacity: 1, translateX: 0, transition: { type: 'spring', duration: 0.5 } },
    }

    return (
        <div className="lg:hidden relative">
            <Menu>
                {({ open }) => (
                    <>
                        <Menu.Button className="font-bold px-5 py-2 flex w-full items-center justify-between border-b border-border dark:border-border-dark group">
                            <span className="flex items-center space-x-2 group-active:top-[0.5px] group-active:scale-[.98] transition-all">
                                {ActiveInternalMenuIcon && (
                                    <ActiveInternalMenuIcon
                                        className={`w-6 h-6 ${
                                            activeInternalMenu?.color ? `text-${activeInternalMenu?.color}` : ''
                                        }`}
                                    />
                                )}
                                <span>{activeInternalMenu?.name}</span>
                            </span>
                            <Chevron
                                className={`w-4 h-4 origin-[center_40%] transition-all group-active:top-[0.5px] group-active:scale-[.98] ${
                                    open ? 'rotate-180' : 'opacity-60'
                                }`}
                            />
                        </Menu.Button>
                        <Menu.Items
                            className="w-full list-none m-0 shadow-lg rounded-md px-5 py-4 dark:bg-accent-dark bg-accent absolute grid space-y-4"
                            as={motion.ul}
                            variants={container}
                            initial="hidden"
                            animate="shown"
                        >
                            {internalMenu.map(({ name, url, icon, color }) => (
                                <Menu.Item variants={child} as={motion.li} key={url}>
                                    {() => {
                                        const Icon = icons[icon]
                                        const active = activeInternalMenu?.name === name
                                        return (
                                            <Link
                                                className="flex items-center active:top-[0.5px] active:scale-[.98] transition-all"
                                                to={url}
                                            >
                                                <span className={`w-6 h-6 mr-2 text-${color} inline-block`}>
                                                    <Icon />
                                                </span>
                                                <span
                                                    className={`text-sm whitespace-nowrap ${
                                                        active
                                                            ? 'font-bold opacity-100'
                                                            : 'font-semibold opacity-60 group-hover:opacity-100'
                                                    }`}
                                                >
                                                    {name}
                                                </span>
                                            </Link>
                                        )
                                    }}
                                </Menu.Item>
                            ))}
                        </Menu.Items>
                    </>
                )}
            </Menu>
        </div>
    )
}

export const Main = () => {
    const { open } = useSearch()
    const { menu, parent, internalMenu, activeInternalMenu, fullWidthContent, setFullWidthContent } = useLayoutData()
    const { pathname } = useLocation()
    const { websiteTheme } = useValues(layoutLogic)
    const { setWebsiteTheme } = useActions(layoutLogic)
    const posthog = usePostHog()

    useEffect(() => {
        if (window) {
            setWebsiteTheme(window.__theme)
            window.__onThemeChange = () => {
                setWebsiteTheme(window.__theme)
                if (posthog) {
                    posthog.people.set({ preferred_theme: window.__theme })
                }
            }
        }
    }, [])

    return (
        <div>
            <div className="border-b border-light dark:border-dark bg-accent dark:bg-accent-dark mb-1">
                <div className="flex max-w-screen-3xl mx-auto px-5 justify-between">
                    <Link className="py-4 grow-0 shrink-0 basis-[auto] dark:text-primary-dark relative" to="/">
                        {pathname === '/' && <ActiveBackground />}
                        <Logo
                            color={websiteTheme === 'dark' && 'white'}
                            className="h-[24px] fill-current relative px-2 box-content"
                        />
                    </Link>

                    <ul className="lg:flex hidden list-none m-0 p-0">
                        {menu.map((menuItem) => {
                            const active = menuItem.name === parent?.name
                            const { name, url } = menuItem
                            return (
                                <li className="h-full" key={name}>
                                    <Link
                                        to={url}
                                        className={`text-[13.5px] font-medium flex h-full items-center relative p-4 ${
                                            active
                                                ? 'px-[calc(1rem_+_10px)] mx-[-10px]'
                                                : 'opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        {active && <ActiveBackground />}
                                        <span className="relative">{name}</span>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                    <div className="flex items-center justify-end">
                        <CallToAction size="sm" type="outline" className="mr-2 " childClassName="">
                            Get started
                        </CallToAction>

                        <button
                            className="group my-1mr-[1px] p-2 hover:bg-border dark:hover:bg-border-dark rounded"
                            onClick={() => open('header')}
                        >
                            <Search className="opacity-50 inline-block w-6 group-hover:opacity-75" />
                        </button>
                        <Tooltip
                            placement="bottom-end"
                            className="group/parent relative text-primary dark:text-primary-dark"
                            content={() => {
                                return (
                                    <ul className="list-none text-left m-0 p-0 pb-[3px] space-y-[2px] w-[200px]">
                                        <li className="bg-border/20 dark:bg-border-dark/20 border-b border-light dark:border-dark text-[13px] px-2 py-1.5 text-primary/50 dark:text-primary-dark/60 z-20 m-0 !mb-[3px] font-semibold">
                                            Go to...
                                        </li>
                                        <li className="px-1">
                                            <Link
                                                className="group/item text-sm px-2 py-2 rounded-sm hover:bg-border dark:hover:bg-border-dark block"
                                                to="https://app.posthog.com"
                                            >
                                                <App className="opacity-50 group-hover/item:opacity-75 inline-block mr-2 w-6" />
                                                PostHog app
                                            </Link>
                                        </li>
                                        <li className="px-1">
                                            <Link
                                                className="group/item text-sm px-2 py-2 rounded-sm hover:bg-border dark:hover:bg-border-dark block"
                                                to="/questions"
                                            >
                                                <Chat className="opacity-50 group-hover/item:opacity-75 inline-block mr-2 w-6" />
                                                Community
                                            </Link>
                                        </li>
                                        <li className="bg-border/20 dark:bg-border-dark/20 border-y border-light dark:border-dark text-[13px] px-2 py-1.5 !my-1 text-primary/50 dark:text-primary-dark/60 z-20 m-0 font-semibold">
                                            Site settings
                                        </li>
                                        <li className="px-1">
                                            <DarkModeToggle />
                                        </li>
                                        <li className="px-1">
                                            <button
                                                onClick={() => setFullWidthContent(!fullWidthContent)}
                                                className="group/item text-sm px-2 py-2 rounded-sm hover:bg-border dark:hover:bg-border-dark flex justify-between items-center w-full"
                                            >
                                                <div>
                                                    <TextWidth className="opacity-50 group-hover/item:opacity-75 inline-block mr-2 w-6" />
                                                    <span>Wide mode</span>
                                                </div>
                                                <Toggle checked={fullWidthContent} />
                                            </button>
                                        </li>
                                    </ul>
                                )
                            }}
                        >
                            <User className="opacity-50 inline-block w-6 group-hover/parent:opacity-75" />
                        </Tooltip>
                    </div>
                </div>
            </div>
            {internalMenu?.length > 0 && (
                <>
                    <ul className="hidden lg:flex justify-center space-x-4 list-none m-0 pt-1 px-4 mb-8 border-b border-light dark:border-dark relative">
                        {internalMenu.map(({ name, url, icon, color }) => {
                            const Icon = icons[icon]
                            const active = activeInternalMenu?.name === name
                            return (
                                <li key={name}>
                                    <Link
                                        to={url}
                                        className={`group flex items-center relative px-2 pt-1.5 pb-1 mb-1 rounded ${
                                            active
                                                ? ''
                                                : 'border border-b-3 border-transparent hover:border-light dark:hover:border-dark hover:translate-y-[-1px] active:translate-y-[1px] active:transition-all'
                                        }`}
                                    >
                                        <span className={`w-6 h-6 mr-2 text-${color}`}>
                                            <Icon />
                                        </span>
                                        <span
                                            className={`text-sm whitespace-nowrap ${
                                                active
                                                    ? 'font-bold opacity-100'
                                                    : 'font-semibold opacity-60 group-hover:opacity-100'
                                            }`}
                                        >
                                            {name}
                                        </span>
                                        <span
                                            className={`absolute bottom-[calc(-.5rem_-_1px)] left-0 w-full border-b-[1.5px] rounded-full transition-colors ${
                                                active ? `border-${color}` : `border-transparent`
                                            }`}
                                        />
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                    <InternalMenuMobile />
                </>
            )}
        </div>
    )
}

export const Mobile = () => {
    const { menu, parent } = useLayoutData()

    return (
        <ul className="flex justify-between fixed bottom-0 w-full lg:hidden list-none m-0 p-0 border-t border-border dark:border-dark bg-accent dark:bg-accent-dark z-[9999] px-4">
            {menu.map((menuItem) => {
                const active = menuItem.name === parent?.name
                const { name, url, icon } = menuItem
                const Icon = icons[icon]
                return (
                    <li className="h-full" key={name}>
                        <Link
                            to={url}
                            className={`text-xs font-medium relative p-2 flex flex-col space-y-1 items-center ${
                                active ? '' : 'opacity-70 hover:opacity-100'
                            }`}
                        >
                            <span className={`w-5 h-5 inline-block`}>
                                <Icon />
                            </span>
                            <span>{name}</span>
                        </Link>
                    </li>
                )
            })}
        </ul>
    )
}
