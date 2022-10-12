import Layout from "@/components/Layout";
import MetaBlock from "@/components/blocks/MetaBlock";
import UploadBlock from "@/components/blocks/UploadBlock";
function Nft() {
  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:p-2">
        <UploadBlock />
        <MetaBlock />
      </div>
    </Layout>
  );
}

export default Nft;