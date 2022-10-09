import "./App.css";
import { useState, useMemo } from "react";

import {
  bundlrStorage,
  Metaplex,
  toMetaplexFileFromBrowser,
  walletAdapterIdentity,
  keypairIdentity
} from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import {
  useConnection,
  ConnectionProvider,
  useWallet,
  WalletProvider
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

function App() {
  const Context = ({ children }) => {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const wallets = useMemo(
      () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
      []
    );
    return (
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    );
  };

  
  // console.log(metaplex)

 
  const Content = () => {
    const [file, setFile] = useState();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    // 
    const connection =new Connection(clusterApiUrl("devnet"))
    // const connection=useConnection()
    const wallet = useWallet()
    const metaplex = Metaplex.make(connection)
      .use(walletAdapterIdentity(wallet))
      .use(bundlrStorage({
        address: 'https://devnet.bundlr.network',
        providerUrl: 'https://api.devnet.solana.com',
        timeout: 60000,
      }));
    
    // 
      const fileHandler = (event) => {
      setFile(event.target.files[0]);
      console.log(file);
    };
    const nameHandler = (e) => {
      setName(e.target.value);
    };
    const descriptionHandler = (event) => {
      setDescription(event.target.value);
    };
    const onSubmit=async (event)=>{
      const data={name:'',description:'',file:''}
      data.name=name
      data.description=description
      data.file= await toMetaplexFileFromBrowser(file)
      const {uri,metadata}= await metaplex.nfts().uploadMetadata(data).run()
      console.log(uri)
      const {nft}= await metaplex.nfts().create({
        name:data.name,
        uri:uri,
        sellerFeeBasisPoints: 500
      }).run()
      console.log(nft)
    }
  
    return (
      <div className="App">
        <div className="upload">
          <h5>Upload file</h5>
          <input type="file" onChange={fileHandler}></input>
        </div>
        <div className="name">
          <h5>Name</h5>
          <input
            type="text"
            name="name"
            id="name"
            className="name"
            onChange={nameHandler}
            value={name}
          />
        </div>
        <WalletMultiButton />
        <div className="description">
          <h5>Description</h5>
          <input className="description" type="text" onChange={descriptionHandler}></input>
        </div>
        <button className="Submit" onClick={onSubmit}>Submit</button>
      </div>
    );
  };

  return (
    <Context>
      <Content />
    </Context>
  );
}

export default App;
