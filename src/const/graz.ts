import { WalletType } from "graz";

export const cosmosWalletInfo: Record<
  string,
  {
    name: string;
    imgSrc: string;
    mobile?: boolean;
  }
> = {
  [WalletType.OKX]: {
    name: "OKX",
    imgSrc:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJDSURBVHgB7Zq9jtpAEMfHlhEgQLiioXEkoAGECwoKxMcTRHmC5E3IoyRPkPAEkI7unJYmTgEFTYwA8a3NTKScLnCHN6c9r1e3P2llWQy7M/s1Gv1twCP0ej37dDq9x+Zut1t3t9vZjDEHIiSRSPg4ZpDL5fxkMvn1cDh8m0wmfugfO53OoFQq/crn8wxfY9EymQyrVCqMfHvScZx1p9ls3pFxXBy/bKlUipGPrVbLuQqAfsCliq3zl0H84zwtjQrOw4Mt1W63P5LvBm2d+Xz+YzqdgkqUy+WgWCy+Mc/nc282m4FqLBYL+3g8fjDxenq72WxANZbLJeA13zDX67UDioL5ybXwafMYu64Ltn3bdDweQ5R97fd7GyhBQMipx4POeEDHIu2LfDdBIGGz+hJ9CQ1ABjoA2egAZPM6AgiCAEQhsi/C4jHyPA/6/f5NG3Ks2+3CYDC4aTccDrn6ojG54MnEvG00GoVmWLIRNZ7wTCwDHYBsdACy0QHIhiuRETxlICWpMMhGZHmqS8qH6JLyGegAZKMDkI0uKf8X4SWlaZo+Pp1bRrwlJU8ZKLIvUjKh0WiQ3sRUbNVq9c5Ebew7KEo2m/1p4jJ4qAmDaqDQBzj5XyiAT4VCQezJigAU+IDU+z8vJFnGWeC+bKQV/5VZ71FV6L7PA3gg3tXrdQ+DgLhC+75Wq3no69P3MC0NFQpx2lL04Ql9gHK1bRDjsSBIvScBnDTk1WrlGIZBorIDEYJj+rhdgnQ67VmWRe0zlplXl81vcyEt0rSoYDUAAAAASUVORK5CYII=",
  },
  [WalletType.KEPLR]: {
    name: "Keplr",
    imgSrc:
      "https://raw.githubusercontent.com/graz-sh/graz/dev/example/starter/public/assets/wallet-icon-keplr.png",
  },
  [WalletType.LEAP]: {
    name: "Leap",
    imgSrc:
      "https://raw.githubusercontent.com/graz-sh/graz/dev/example/starter/public/assets/wallet-icon-leap.png",
  },
  [WalletType.COSMOSTATION]: {
    name: "Cosmostation",
    imgSrc:
      "https://raw.githubusercontent.com/graz-sh/graz/dev/example/starter/public/assets/wallet-icon-cosmostation.png",
  },
  [WalletType.VECTIS]: {
    name: "Vectis",
    imgSrc:
      "https://raw.githubusercontent.com/graz-sh/graz/dev/example/starter/public/assets/wallet-icon-vectis.svg",
  },
  [WalletType.STATION]: {
    name: "Station",
    imgSrc:
      "https://raw.githubusercontent.com/graz-sh/graz/dev/example/starter/public/assets/wallet-icon-station.svg",
  },
  [WalletType.XDEFI]: {
    name: "XDefi",
    imgSrc:
      "https://raw.githubusercontent.com/graz-sh/graz/dev/example/starter/public/assets/wallet-icon-xdefi.jpeg",
  },
  [WalletType.METAMASK_SNAP_LEAP]: {
    name: "Metamask Snap Leap",
    imgSrc:
      "https://raw.githubusercontent.com/graz-sh/graz/dev/example/starter/public/assets/wallet-icon-metamask.png",
  },
  [WalletType.METAMASK_SNAP_COSMOS]: {
    name: "Metamask Snap Cosmos",
    imgSrc:
      "https://raw.githubusercontent.com/graz-sh/graz/dev/example/starter/public/assets/wallet-icon-metamask.png",
  },
  [WalletType.WALLETCONNECT]: {
    name: "WalletConnect",
    imgSrc:
      "https://raw.githubusercontent.com/graz-sh/graz/dev/example/starter/public/assets/wallet-icon-walletconnect.png",
  },
  [WalletType.WC_KEPLR_MOBILE]: {
    name: "Keplr Mobile",
    imgSrc:
      "https://raw.githubusercontent.com/graz-sh/graz/dev/example/starter/public/assets/wallet-icon-keplr.png",
    mobile: true,
  },
  [WalletType.WC_LEAP_MOBILE]: {
    name: "Leap Mobile",
    imgSrc:
      "https://raw.githubusercontent.com/graz-sh/graz/dev/example/starter/public/assets/wallet-icon-leap.png",
    mobile: true,
  },
  [WalletType.WC_COSMOSTATION_MOBILE]: {
    name: "Cosmostation Mobile",
    imgSrc:
      "https://raw.githubusercontent.com/graz-sh/graz/dev/example/starter/public/assets/wallet-icon-cosmostation.png",
    mobile: true,
  },
  [WalletType.CAPSULE]: {
    name: "Capsule",
    imgSrc:
      "https://raw.githubusercontent.com/graz-sh/graz/dev/example/starter/public/assets/wallet-icon-capsule.jpg",
  },
  [WalletType.COSMIFRAME]: {
    name: "DAO DAO",
    imgSrc:
      "https://raw.githubusercontent.com/graz-sh/graz/dev/example/starter/public/assets/wallet-icon-daodao.png",
  },
  [WalletType.COMPASS]: {
    name: "Compass",
    imgSrc:
      "https://raw.githubusercontent.com/graz-sh/graz/dev/example/starter/public/assets/wallet-icon-compass.png",
  },
};

export const getCosmosWalletInfo = (walletType: WalletType) => {
  return cosmosWalletInfo[walletType];
};
