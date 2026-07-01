import { ClockIcon, MessageSquare, BarChart2, FileTextIcon, UserPlusIcon, CreditCardIcon, SettingsIcon, LogOut, Headphones, ChartPieIcon, LucideIcon, MessagesSquareIcon, NewspaperIcon, MegaphoneIcon, LineChartIcon, MessageSquareTextIcon, UsersIcon } from 'lucide-react';

type Link = {
    href: string;
    label: string;
    icon: LucideIcon;
}

export const SIDEBAR_LINKS: Link[] = [
    {
        href: "/dashboard",
        label: "Dashboard",
        icon: ChartPieIcon,
    },
    {
        href: "/dashboard/campaigns",
        label: "Campaigns",
        icon: MegaphoneIcon
    },
    {
        href: "/dashboard/analytics",
        label: "Analytics",
        icon: LineChartIcon
    },
    {
        href: "/dashboard/posts",
        label: "Posts",
        icon: MessageSquareTextIcon
    },
    {
        href: "/dashboard/engagement",
        label: "Engagement",
        icon: UsersIcon
    },
    {
        href: "/dashboard/billing",
        label: "Billing",
        icon: CreditCardIcon
    },
    {
        href: "/dashboard/settings",
        label: "Settings",
        icon: SettingsIcon
    },
];

export const CHAT_URL = "https://chat.prodmate.dev/";

export const FOOTER_LINKS = [
    {
        title: "Product",
        links: [
            { name: "Home", href: "/" },
            { name: "Features", href: "/#features" },
            { name: "Pricing", href: "/#pricing" },
            { name: "Contact", href: "mailto:krishgupta0072@gmail.com" },
        ],
    },
    {
        title: "Resources",
        links: [
            { name: "Docs", href: "/docs" },
            { name: "Get Started", href: "/docs#getting-started" },
            { name: "Integrations", href: `${CHAT_URL}integrations` },
        ],
    },
    {
        title: "Legal",
        links: [
            { name: "Privacy", href: `${CHAT_URL}privacy` },
            { name: "Terms", href: `${CHAT_URL}terms` },
            { name: "Cookies", href: `${CHAT_URL}cookies` },
        ],
    },
];

