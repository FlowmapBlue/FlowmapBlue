import FlowMapPage, {getFlowMapServerSideProps} from '../[id]';

export interface Props {}

const FlowMapEmbedPage: React.FC<Props> = (props) => {
  const {} = props;
  return <FlowMapPage embed={true} />;
};

export default FlowMapEmbedPage;

export const getServerSideProps = getFlowMapServerSideProps(true);
