import {keyBy, pick} from 'lodash-es'
import {createContext, useContext, useEffect, useState} from 'react'

type AppT = {
	id: string
	name: string
	icon: string
}

export const systemApps = [
	{
		id: 'home',
		name: 'Home',
		icon: '/dock/home.png',
	},
	{
		id: 'app-store',
		name: 'App Store',
		icon: '/dock/shop.png',
	},
	{
		id: 'settings',
		name: 'Settings',
		icon: '/dock/settings.png',
	},
	{
		id: 'exit',
		name: 'Logout',
		icon: '/dock/exit.png',
	},
] as const satisfies readonly AppT[]

export const systemAppsKeyed = keyBy(systemApps, 'id') as {
	[K in (typeof systemApps)[number]['id']]: AppT
}

type DemoAppsContextT = {
	installedApps: AppT[]
	installedAppsKeyed: Record<string, AppT>
	// needs to be explicitly readonly so typescript doesn't complain, though all other props are technically readonly too
	systemApps: readonly AppT[]
	systemAppsKeyed: typeof systemAppsKeyed
	allApps: AppT[]
	allAppsKeyed: Record<string, AppT>
	isLoading: boolean
}
const InstalledAppsContext = createContext<DemoAppsContextT | null>(null)

/** Simulate installed apps */
export function InstalledAppsProvider({children}: {children: React.ReactNode}) {
	const [installedApps, setInstalledApps] = useState<AppT[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		fetch('https://apps.umbrel.com/api/v1/apps/tmp-dump')
			.then((res) => res.json())
			.then((data) => {
				setInstalledApps(data.data.map((app: AppT) => pick(app, ['id', 'name', 'icon'])))
				setIsLoading(false)
			})
	}, [])

	const installedAppsKeyed = keyBy(installedApps, 'id')

	const allApps = [...installedApps, ...systemApps]
	const allAppsKeyed = keyBy(allApps, 'id')

	return (
		<InstalledAppsContext.Provider
			value={{
				installedApps,
				installedAppsKeyed,
				systemApps,
				systemAppsKeyed,
				allApps,
				allAppsKeyed,
				isLoading,
			}}
		>
			{children}
		</InstalledAppsContext.Provider>
	)
}

/** Simulate installed apps */
export function useInstalledApps() {
	const ctx = useContext(InstalledAppsContext)
	if (!ctx) throw new Error('useApps must be used within AppsProvider')

	return ctx
}