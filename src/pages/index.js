import Layout from "@/components/Layout";
import AssetBlock from "@/components/blocks/AssetBlock";
import MintBlock from "@/components/blocks/MintBlock";
import { useAppContext } from "@/state/context";
function Mint() {
  const { state, dispatch } = useAppContext();
  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 p-3">
        <AssetBlock />
        <MintBlock />
      </div>
    </Layout>
  );
}

export default Mint;