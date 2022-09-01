import Layout from "@/components/Layout";
import AssetBlock from "@/components/blocks/AssetBlock";
import MintBlock from "@/components/blocks/MintBlock";
function Mint() {
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