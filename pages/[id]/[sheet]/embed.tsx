import {default as FlowMapEmbedPage} from '../embed';
import {getFlowMapServerSideProps} from '../../[id]';

export const getServerSideProps = getFlowMapServerSideProps(true);

export default FlowMapEmbedPage;
