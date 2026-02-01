import type { ComponentProps } from "react";

import { BrowserOnly } from "@ngrok/mantle/browser-only";
import { IconButton } from "@ngrok/mantle/button";
import { cx } from "@ngrok/mantle/cx";
import { DropdownMenu } from "@ngrok/mantle/dropdown-menu";
import { Icon } from "@ngrok/mantle/icon";
import { ThemeIcon, AutoThemeIcon } from "@ngrok/mantle/icons";
import { Skeleton } from "@ngrok/mantle/skeleton";
import { useTheme, $theme, isTheme } from "@ngrok/mantle/theme";

export function Header({ className, ...props }: Omit<ComponentProps<"header">, "children">) {
	return (
		<header className={cx("flex h-16 items-center justify-end gap-2 px-6", className)} {...props}>
			<ThemeSwitcher />
		</header>
	);
}

/**
 * Button + dropdown that allows the user to choose the UI theme.
 *
 * Reads and writes the active theme using {@link useTheme}. Items are implemented as a
 * `RadioGroup` for a11y and single selection semantics.
 */
function ThemeSwitcher({ className, ...props }: ComponentProps<typeof DropdownMenu.Trigger>) {
	const [currentTheme, setTheme] = useTheme();

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<IconButton
					type="button"
					appearance="ghost"
					className={cx("shrink-0 rounded-full", className)}
					{...props}
					label="Change Theme"
					icon={
						<BrowserOnly fallback={<Skeleton className="size-5 rounded-full" />}>
							{() => <AutoThemeIcon className="size-5" />}
						</BrowserOnly>
					}
				/>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" className="font-sans">
				<DropdownMenu.RadioGroup
					value={currentTheme}
					onValueChange={(value) => {
						if (isTheme(value)) {
							setTheme(value);
						}
					}}
				>
					<DropdownMenu.RadioItem name="theme" value={$theme("system")}>
						<Icon
							svg={<ThemeIcon theme="system" />}
							className={cx("text-muted", currentTheme === "system" && "text-on-filled")}
						/>
						System Preference
					</DropdownMenu.RadioItem>
					<DropdownMenu.RadioItem name="theme" value={$theme("light")}>
						<Icon
							svg={<ThemeIcon theme="light" />}
							className={cx("text-muted", currentTheme === "light" && "text-on-filled")}
						/>
						Light Mode
					</DropdownMenu.RadioItem>
					<DropdownMenu.RadioItem name="theme" value={$theme("dark")}>
						<Icon
							svg={<ThemeIcon theme="dark" />}
							className={cx("text-muted", currentTheme === "dark" && "text-on-filled")}
						/>
						Dark Mode
					</DropdownMenu.RadioItem>
					<DropdownMenu.RadioItem name="theme" value={$theme("light-high-contrast")}>
						<Icon
							svg={<ThemeIcon theme="light-high-contrast" />}
							className={cx("text-muted", currentTheme === "light-high-contrast" && "text-on-filled")}
						/>
						Light High Contrast
					</DropdownMenu.RadioItem>
					<DropdownMenu.RadioItem name="theme" value={$theme("dark-high-contrast")}>
						<Icon
							svg={<ThemeIcon theme="dark-high-contrast" />}
							className={cx("text-muted", currentTheme === "dark-high-contrast" && "text-on-filled")}
						/>
						Dark High Contrast
					</DropdownMenu.RadioItem>
				</DropdownMenu.RadioGroup>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	);
}
