import {
    AboutAptosConnect,
    AboutAptosConnectEducationScreen,
    AdapterNotDetectedWallet,
    AdapterWallet,
    WalletItem,
    groupAndSortWallets,
    isInstallRequired,
    truncateAddress,
    useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { ArrowLeft, ArrowRight, ChevronDown, Copy, LogOut } from "lucide-react";
import { useCallback, useState, useMemo } from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

export function WalletSelector() {
    const { account, connected, disconnect } = useWallet();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const closeDialog = useCallback(() => setIsDialogOpen(false), []);

    const copyAddress = useCallback(async () => {
        if (!account?.address.toStringLong()) return;
        try {
            await navigator.clipboard.writeText(account.address.toStringLong());
            toast({
                title: "Success",
                description: "Copied wallet address to clipboard.",
            });
        } catch {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to copy wallet address.",
            });
        }
    }, [account?.address, toast]);

    return connected ? (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="px-4 py-2 bg-grey-100 dark:bg-grey-800 hover:bg-grey-200 dark:hover:bg-grey-700 rounded-lg text-grey-900 dark:text-grey-100 font-medium text-sm transition-colors">
                    {account?.ansName || truncateAddress(account?.address.toStringLong()) || "Unknown"}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-grey-900 border border-grey-200 dark:border-grey-700">
                <DropdownMenuItem onSelect={copyAddress} className="gap-2 text-grey-900 dark:text-grey-100 hover:bg-grey-100 dark:hover:bg-grey-800">
                    <Copy className="h-4 w-4" /> Copy address
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={disconnect} className="gap-2 text-grey-900 dark:text-grey-100 hover:bg-grey-100 dark:hover:bg-grey-800">
                    <LogOut className="h-4 w-4" /> Disconnect
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    ) : (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <button className="btn-aptos">Connect Wallet</button>
            </DialogTrigger>
            <ConnectWalletDialog close={closeDialog} />
        </Dialog>
    );
}

interface ConnectWalletDialogProps {
    close: () => void;
}

function ConnectWalletDialog({ close }: ConnectWalletDialogProps) {
    const { wallets = [], notDetectedWallets = [] } = useWallet();

    const { availableWallets, installableWallets } = useMemo(
        () => groupAndSortWallets([...wallets, ...notDetectedWallets]),
        [wallets, notDetectedWallets]
    );

    return (
        <DialogContent className="max-h-screen overflow-auto bg-white dark:bg-grey-900 border border-grey-200 dark:border-grey-700 shadow-2xl">
            <AboutAptosConnect renderEducationScreen={renderEducationScreen}>
                <DialogHeader className="flex flex-col items-center pb-4">
                    <DialogTitle className="flex flex-col text-center leading-snug">
                        <span className="text-2xl font-display font-bold text-grey-900 dark:text-grey-100">Connect Wallet</span>
                        <span className="text-lg text-grey-600 dark:text-grey-400">Choose your preferred Aptos wallet</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3 pt-3">
                    {availableWallets.map((wallet) => (
                        <WalletRow key={wallet.name} wallet={wallet} onConnect={close} />
                    ))}
                    {!!installableWallets.length && (
                        <Collapsible className="flex flex-col gap-3">
                            <CollapsibleTrigger asChild>
                                <button className="text-sm py-2 text-grey-600 dark:text-grey-400 hover:text-grey-900 dark:hover:text-grey-100 transition-colors flex items-center justify-center gap-2">
                                    More wallets <ChevronDown className="w-4 h-4" />
                                </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="flex flex-col gap-3">
                                {installableWallets.map((wallet) => (
                                    <WalletRow key={wallet.name} wallet={wallet} onConnect={close} />
                                ))}
                            </CollapsibleContent>
                        </Collapsible>
                    )}
                </div>
            </AboutAptosConnect>
        </DialogContent>
    );
}

interface WalletRowProps {
    wallet: AdapterWallet | AdapterNotDetectedWallet;
    onConnect?: () => void;
}

function WalletRow({ wallet, onConnect }: WalletRowProps) {
    return (
        <WalletItem
            wallet={wallet}
            onConnect={onConnect}
            className="flex items-center justify-between px-4 py-3 gap-4 rounded-lg bg-grey-50 dark:bg-grey-800 hover:bg-grey-100 dark:hover:bg-grey-700 border border-grey-200 dark:border-grey-700 transition-all duration-200"
        >
            <div className="flex items-center gap-4">
                <WalletItem.Icon className="h-6 w-6" />
                <WalletItem.Name className="text-base font-normal text-grey-900 dark:text-grey-100" />
            </div>
            {isInstallRequired(wallet) ? (
                <WalletItem.InstallLink className="text-sm text-aptos-green hover:text-aptos-green-dark transition-colors" />
            ) : (
                <WalletItem.ConnectButton asChild>
                    <button className="btn-aptos text-sm px-4 py-2">Connect</button>
                </WalletItem.ConnectButton>
            )}
        </WalletItem>
    );
}

function renderEducationScreen(screen: AboutAptosConnectEducationScreen) {
    return (
        <>
            <DialogHeader className="grid grid-cols-[1fr_4fr_1fr] items-center space-y-0">
                <button onClick={screen.cancel} className="p-2 hover:bg-grey-100 dark:hover:bg-grey-800 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5 text-grey-900 dark:text-grey-100" />
                </button>
                <DialogTitle className="leading-snug text-base text-center text-grey-900 dark:text-grey-100">About Aptos Connect</DialogTitle>
            </DialogHeader>

            <div className="flex h-[162px] pb-3 items-end justify-center">
                <screen.Graphic />
            </div>
            <div className="flex flex-col gap-2 text-center pb-4">
                <screen.Title className="text-xl text-grey-900 dark:text-grey-100" />
                <screen.Description className="text-sm text-grey-600 dark:text-grey-400 [&>a]:underline [&>a]:underline-offset-4 [&>a]:text-grey-900 dark:[&>a]:text-grey-100" />
            </div>

            <div className="grid grid-cols-3 items-center">
                <button onClick={screen.back} className="text-sm px-4 py-2 text-grey-600 dark:text-grey-400 hover:text-grey-900 dark:hover:text-grey-100 transition-colors justify-self-start">
                    Back
                </button>
                <div className="flex items-center gap-2 place-self-center">
                    {screen.screenIndicators.map((ScreenIndicator, i) => (
                        <ScreenIndicator key={i} className="py-4">
                            <div className="h-0.5 w-6 transition-colors bg-grey-300 dark:bg-grey-700 [[data-active]>&]:bg-grey-900 dark:[[data-active]>&]:bg-grey-100" />
                        </ScreenIndicator>
                    ))}
                </div>
                <button onClick={screen.next} className="text-sm px-4 py-2 text-grey-600 dark:text-grey-400 hover:text-grey-900 dark:hover:text-grey-100 transition-colors flex items-center gap-2 justify-self-end">
                    {screen.screenIndex === screen.totalScreens - 1 ? "Finish" : "Next"}
                    <ArrowRight size={16} />
                </button>
            </div>
        </>
    );
}
