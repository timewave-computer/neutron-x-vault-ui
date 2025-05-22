import { ConfigureGrazArgs, defineChainInfo } from "graz";
import { neutron } from "graz/chains";
const NEUTRON_SIM_TESTNET_RPC_URL =
  process.env.NEXT_PUBLIC_NEUTRON_SIM_TESTNET_RPC_URL;
if (!NEUTRON_SIM_TESTNET_RPC_URL) {
  throw new Error("NEXT_PUBLIC_NEUTRON_SIM_TESTNET_RPC_URL is not set");
}
const neutronSimTestnet = defineChainInfo({
  chainId: "sim-neutron-1",
  currencies: [
    {
      coinDenom: "ntrn",
      coinMinimalDenom: "untrn",
      coinDecimals: 6,
      coinGeckoId: "neutron-3",
    },
    {
      coinDenom: "atom",
      coinMinimalDenom:
        "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9",
      coinDecimals: 6,
      coinGeckoId: "cosmos",
    },
    {
      coinDenom: "axlusdc",
      coinMinimalDenom:
        "ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349",
      coinDecimals: 6,
      coinGeckoId: "axlusdc",
    },
    {
      coinDenom: "tia",
      coinMinimalDenom:
        "ibc/773B4D0A3CD667B2275D5A4A7A2F0909C0BA0F4059C0B9181E680DDF4965DCC7",
      coinDecimals: 6,
      coinGeckoId: "celestia",
    },
    {
      coinDenom: "elys",
      coinMinimalDenom:
        "ibc/28FC965E05DB1A4C0A6DE6B720F67AFF8CAB571FE262824976DDDFF49A4BAAF7",
      coinDecimals: 6,
      coinGeckoId: "elys-network",
    },
    {
      coinDenom: "ASTROPEPE",
      coinMinimalDenom:
        "factory/neutron14henrqx9y328fjrdvz6l6d92r0t7g5hk86q5nd/uastropepe",
      coinDecimals: 6,
    },
    {
      coinDenom: "wstETH",
      coinMinimalDenom:
        "factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH",
      coinDecimals: 18,
    },
    {
      coinDenom: "dydx",
      coinMinimalDenom:
        "ibc/2CB87BCE0937B1D1DFCEE79BE4501AAF3C265E923509AEAC410AD85D27F35130",
      coinDecimals: 18,
      coinGeckoId: "dydx-chain",
    },
    {
      coinDenom: "newt",
      coinMinimalDenom:
        "factory/neutron1p8d89wvxyjcnawmgw72klknr3lg9gwwl6ypxda/newt",
      coinDecimals: 6,
      coinGeckoId: "newt",
    },
    {
      coinDenom: "astro",
      coinMinimalDenom:
        "factory/neutron1ffus553eet978k024lmssw0czsxwr97mggyv85lpcsdkft8v9ufsz3sa07/astro",
      coinDecimals: 6,
      coinGeckoId: "astroport-fi",
    },
    {
      coinDenom: "xASTRO",
      coinMinimalDenom:
        "factory/neutron1zlf3hutsa4qnmue53lz2tfxrutp8y2e3rj4nkghg3rupgl4mqy8s5jgxsn/xASTRO",
      coinDecimals: 6,
    },
    {
      coinDenom: "astro.cw20",
      coinMinimalDenom:
        "ibc/5751B8BCDA688FD0A8EC0B292EEF1CDEAB4B766B63EC632778B196D317C40C3A",
      coinDecimals: 6,
    },
    {
      coinDenom: "corgi",
      coinMinimalDenom:
        "factory/neutron1tklm6cvr2wxg8k65t8gh5ewslnzdfd5fsk0w3f/corgi",
      coinDecimals: 6,
    },
    {
      coinDenom: "circus",
      coinMinimalDenom:
        "factory/neutron170v88vrtnedesyfytuku257cggxc79rd7lwt7q/ucircus",
      coinDecimals: 6,
    },
    {
      coinDenom: "jimmy",
      coinMinimalDenom:
        "factory/neutron108x7vp9zv22d6wxrs9as8dshd3pd5vsga463yd/JIMMY",
      coinDecimals: 6,
    },
    {
      coinDenom: "bad",
      coinMinimalDenom:
        "factory/neutron143wp6g8paqasnuuey6zyapucknwy9rhnld8hkr/bad",
      coinDecimals: 6,
    },
    {
      coinDenom: "bitcosmos",
      coinMinimalDenom:
        "neutron1fjzg7fmv770hsvahqm0nwnu6grs3rjnd2wa6fvm9unv6vedkzekqpw44qj",
      coinDecimals: 6,
    },
    {
      coinDenom: "wtf",
      coinMinimalDenom:
        "neutron12h09p8hq5y4xpsmcuxxzsn9juef4f6jvekp8yefc6xnlwm6uumnsdk29wf",
      coinDecimals: 6,
    },
    {
      coinDenom: "nls",
      coinMinimalDenom:
        "ibc/6C9E6701AC217C0FC7D74B0F7A6265B9B4E3C3CDA6E80AADE5F950A8F52F9972",
      coinDecimals: 6,
      coinGeckoId: "nolus",
    },
    {
      coinDenom: "goddard",
      coinMinimalDenom:
        "factory/neutron1t5qrjtyryh8gzt800qr5vylhh2f8cmx4wmz9mc/ugoddard",
      coinDecimals: 6,
    },
    {
      coinDenom: "apollo",
      coinMinimalDenom:
        "factory/neutron154gg0wtm2v4h9ur8xg32ep64e8ef0g5twlsgvfeajqwghdryvyqsqhgk8e/APOLLO",
      coinDecimals: 6,
    },
    {
      coinDenom: "newtroll",
      coinMinimalDenom:
        "factory/neutron1ume2n42r5j0660gegrr28fzdze7aqf7r5cd9y6/newtroll",
      coinDecimals: 6,
    },
    {
      coinDenom: "retro",
      coinMinimalDenom:
        "factory/neutron1t24nc7whl77relnu3taxyg3p66pjyuk82png2y/uretro",
      coinDecimals: 6,
    },
    {
      coinDenom: "goddard",
      coinMinimalDenom:
        "factory/neutron1yqj9vcc0y73xfxjzegaj4v8q0zefevnlpuh4rj/GODDARD",
      coinDecimals: 6,
    },
    {
      coinDenom: "WOSMO",
      coinMinimalDenom:
        "ibc/7DA39F5140741177846FCF3CFAB14450EE7F57B7794E5A94BEF73825D3741958",
      coinDecimals: 6,
    },
    {
      coinDenom: "boy",
      coinMinimalDenom:
        "neutron1uqvse8fdrd9tam47f2jhy9m6al6xxtqpc83f9pdnz5gdle4swc0spfnctv",
      coinDecimals: 6,
    },
    {
      coinDenom: "BADKID",
      coinMinimalDenom:
        "ibc/9F8417FBA11E5E01F7F85DDD48C400EB746E95084C11706041663845B4A700A8",
      coinDecimals: 6,
    },
    {
      coinDenom: "cartel",
      coinMinimalDenom:
        "factory/neutron1w0pz4mjw7n96kkragj8etgfgakg5vw9lzg77wq/cartel",
      coinDecimals: 6,
    },
    {
      coinDenom: "ATOM1KLFG",
      coinMinimalDenom:
        "factory/neutron13lkh47msw28yynspc5rnmty3yktk43wc3dsv0l/ATOM1KLFG",
      coinDecimals: 6,
    },
    {
      coinDenom: "usdc",
      coinMinimalDenom:
        "ibc/B559A80D62249C8AA07A380E2A2BEA6E5CA9A6F079C912C3A9E9B494105E4F81",
      coinDecimals: 6,
      coinGeckoId: "usd-coin",
    },
    {
      coinDenom: "WEIRD",
      coinMinimalDenom:
        "factory/neutron133xakkrfksq39wxy575unve2nyehg5npx75nph/WEIRD",
      coinDecimals: 6,
    },
    {
      coinDenom: "takumi",
      coinMinimalDenom:
        "factory/neutron19tynwawkm2rgefqxy7weupu4hdamyhg890zep2/TAKUMI",
      coinDecimals: 6,
    },
    {
      coinDenom: "NBZ",
      coinMinimalDenom:
        "ibc/A79E35F2418EB26FA8D72B9AA5EDF28C0C2CF475E8CF4CAEBB25FA5C858D4D22",
      coinDecimals: 6,
    },
    {
      coinDenom: "MARS",
      coinMinimalDenom:
        "factory/neutron1ndu2wvkrxtane8se2tr48gv7nsm46y5gcqjhux/MARS",
      coinDecimals: 6,
      coinGeckoId: "mars-protocol-a7fcbcfb-fd61-4017-92f0-7ee9f9cc6da3",
    },
    {
      coinDenom: "dNTRN",
      coinMinimalDenom:
        "factory/neutron1frc0p5czd9uaaymdkug2njz7dc7j65jxukp9apmt9260a8egujkspms2t2/udntrn",
      coinDecimals: 6,
    },
    {
      coinDenom: "dATOM",
      coinMinimalDenom:
        "factory/neutron1k6hr0f83e7un2wjf29cspk7j69jrnskk65k3ek2nj9dztrlzpj6q00rtsa/udatom",
      coinDecimals: 6,
      coinGeckoId: "drop-staked-atom",
    },
    {
      coinDenom: "SIN",
      coinMinimalDenom:
        "factory/neutron133xakkrfksq39wxy575unve2nyehg5npx75nph/sin",
      coinDecimals: 6,
    },
    {
      coinDenom: "GOP",
      coinMinimalDenom:
        "factory/neutron133xakkrfksq39wxy575unve2nyehg5npx75nph/GOP",
      coinDecimals: 6,
    },
    {
      coinDenom: "arena",
      coinMinimalDenom:
        "factory/neutron129ukd5cwahcjkccujz87rjemjukff7jf6sau72qrhva677xgz9gs4m4jeq/uarena",
      coinDecimals: 6,
    },
    {
      coinDenom: "AXV",
      coinMinimalDenom:
        "cw20:neutron10dxyft3nv4vpxh5vrpn0xw8geej8dw3g39g7nqp8mrm307ypssksau29af",
      coinDecimals: 6,
      coinGeckoId: "astrovault",
    },
    {
      coinDenom: "axlwbtc",
      coinMinimalDenom:
        "ibc/DF8722298D192AAB85D86D0462E8166234A6A9A572DD4A2EA7996029DF4DB363",
      coinDecimals: 8,
      coinGeckoId: "axlwbtc",
    },
    {
      coinDenom: "xATOM",
      coinMinimalDenom:
        "cw20:neutron1vjl4ze7gr32lar5s4fj776v70j4ml7mlt4aqln2hwgfhqjck8xwqfhx8vj",
      coinDecimals: 6,
      coinGeckoId: "astrovault-xatom",
    },
    {
      coinDenom: "amATOM",
      coinMinimalDenom:
        "factory/neutron1shwxlkpdjd8h5wdtrykypwd2v62z5glr95yp0etdcspkkjwm5meq82ndxs/amatom",
      coinDecimals: 6,
    },
    {
      coinDenom: "JSD",
      coinMinimalDenom:
        "factory/neutron1mdy5fhtwdjagp5eallsdhlx6gxylm8rxqk72wjzg6y5d5kt44ysqprkduw/JSD",
      coinDecimals: 6,
    },
    {
      coinDenom: "FUEL",
      coinMinimalDenom:
        "factory/neutron1zl2htquajn50vxu5ltz0y5hf2qzvkgnjaaza2rssef268xplq6vsjuruxm/fuel",
      coinDecimals: 6,
    },
    {
      coinDenom: "bglUSDC",
      coinMinimalDenom:
        "factory/neutron16ue9kysgneyqktmjxdfshajgvlrcx9rehxz8x9th7g8fgtnlxwuqvg9mgp/bglUSDC",
      coinDecimals: 6,
    },
    {
      coinDenom: "dTIA",
      coinMinimalDenom:
        "factory/neutron1ut4c6pv4u6vyu97yw48y8g7mle0cat54848v6m97k977022lzxtsaqsgmq/udtia",
      coinDecimals: 6,
    },
    {
      coinDenom: "NEPT",
      coinMinimalDenom:
        "ibc/C084B31AB4906CD6CC65CB779B1527A66B6C98629259E3548B2F20D2753D5837",
      coinDecimals: 6,
    },
    {
      coinDenom: "doge",
      coinMinimalDenom:
        "ibc/F16C7C5B6F7E96ACDA73E35BCA3A3DE49DDF7164066A359C843E9709041CE6B9",
      coinDecimals: 8,
    },
    {
      coinDenom: "btc",
      coinMinimalDenom:
        "ibc/D9E2128761E0A60C6C7C166BF30A23E9C2029576817F16CD4BD4F598A2077C04",
      coinDecimals: 8,
    },
    {
      coinDenom: "bch",
      coinMinimalDenom:
        "ibc/1D45F4770FA033E69A3A3B751263FD774952C2452F65944A1CB914E58C74A35B",
      coinDecimals: 8,
    },
    {
      coinDenom: "ltc",
      coinMinimalDenom:
        "ibc/C4C791209A16419A4BB3C3177E5E8AE4477C9D7457842E7F531F91C513FA79A0",
      coinDecimals: 8,
    },
  ],
  rest: "https://rest-lb.neutron.org",
  rpc: "https://rpc-lb.neutron.org",
  bech32Config: {
    bech32PrefixAccAddr: "neutron",
    bech32PrefixAccPub: "neutronpub",
    bech32PrefixValAddr: "neutronvaloper",
    bech32PrefixValPub: "neutronvaloperpub",
    bech32PrefixConsAddr: "neutronvalcons",
    bech32PrefixConsPub: "neutronvalconspub",
  },
  chainName: "neutron",
  feeCurrencies: [
    {
      coinDenom: "ntrn",
      coinMinimalDenom: "untrn",
      coinDecimals: 6,
      coinGeckoId: "neutron-3",
      gasPriceStep: {
        low: 0.0053,
        average: 0.0053,
        high: 0.0053,
      },
    },
    {
      coinDenom: "atom",
      coinMinimalDenom:
        "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9",
      coinDecimals: 6,
      coinGeckoId: "cosmos",
      gasPriceStep: {
        low: 0.0008,
        average: 0.0008,
        high: 0.0008,
      },
    },
    {
      coinDenom: "axlusdc",
      coinMinimalDenom:
        "ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349",
      coinDecimals: 6,
      coinGeckoId: "axlusdc",
      gasPriceStep: {
        low: 0.008,
        average: 0.008,
        high: 0.008,
      },
    },
    {
      coinDenom: "wstETH",
      coinMinimalDenom:
        "factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH",
      coinDecimals: 18,
      gasPriceStep: {
        low: 2903231.6597,
        average: 2903231.6597,
        high: 2903231.6597,
      },
    },
    {
      coinDenom: "dydx",
      coinMinimalDenom:
        "ibc/2CB87BCE0937B1D1DFCEE79BE4501AAF3C265E923509AEAC410AD85D27F35130",
      coinDecimals: 18,
      coinGeckoId: "dydx-chain",
      gasPriceStep: {
        low: 2564102564.1026,
        average: 2564102564.1026,
        high: 2564102564.1026,
      },
    },
    {
      coinDenom: "tia",
      coinMinimalDenom:
        "ibc/773B4D0A3CD667B2275D5A4A7A2F0909C0BA0F4059C0B9181E680DDF4965DCC7",
      coinDecimals: 6,
      coinGeckoId: "celestia",
      gasPriceStep: {
        low: 0.0004,
        average: 0.0004,
        high: 0.0004,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: "ntrn",
    coinMinimalDenom: "untrn",
    coinDecimals: 6,
    coinGeckoId: "neutron-3",
  },
  bip44: {
    coinType: 118,
  },
});

export const allSupportedCosmosChains = [neutron, neutronSimTestnet];

export const grazOptions: ConfigureGrazArgs = {
  chains: allSupportedCosmosChains,
  chainsConfig: {
    "neutron-1": {
      gas: {
        price: "0.005",
        denom: "untrn",
      },
    },
    "sim-neutron-1": {
      gas: {
        price: "0.005",
        denom: "untrn",
      },
    },
  },
};

export const defaultCosmosChainId = "neutron-1";

export const getChainInfo = (chainId: string) => {
  const chain = allSupportedCosmosChains.find(
    (chain) => chain.chainId === chainId,
  );
  if (!chain) return undefined;
  return chain;
};
