import React, { Component } from 'react';
import Layout from '../../components/Layout';
import Campaign from '../../ethereum/campaign';
import { Card, Grid, Button } from 'semantic-ui-react';
import web3 from '../../ethereum/web3';
import ContributeForm from '../../components/ContributeForm';
import { Link } from '../../routes';


class CampaignShow extends Component {
  static async getInitialProps(props) {
    const campaign = Campaign(props.query.address);

    const summary = await campaign.methods.getSummary().call();


    return {
        minimumContribution: summary[0],
        balance: summary[1],
        requestsCount: summary[2],
        approversCount: summary[3],
        manager: summary[4],
        address: props.query.address
    };
  }

  renderCards() {
    const items = [
      {
        header: this.props.manager,
        meta: 'Address of Manager',
        description: 'The manager created this campaign and can create requests to withdraw money',
        style: { overflowWrap: 'break-word' }
      },
      {
        header: this.props.minimumContribution,
        description:
          'You must contribute at least this much wei to become an approver',
        meta: 'Minimum Contribution (wei)',
      },
      {
        header: this.props.requestsCount,
        description:
          'A request tries to withdraw money from the contract. Requests must be approved by approvers.',
        meta: 'Number of Requests',
      },
      {
        header: this.props.approversCount,
        description:
          'Number of people who have already donated to this campaign',
        meta: 'Number of Approvers',
      },
      {
        header: web3.utils.fromWei(this.props.balance, 'ether'),
        description:
          'This balance is how much money this campaign has left to spend.',
        meta: 'Campaign Balance (ether)',
      },
    ]

    return <Card.Group items={items} />;
  }

  render() {
    console.log(this.props.minimumContribution);
    return (

      <Layout>
        <h3>Show Campaign!</h3>
        <Grid>
          <Grid.Row>
            <Grid.Column width={10}>
              {this.renderCards()}
            </Grid.Column>
            <Grid.Column width={6}>
              <ContributeForm address={this.props.address}/>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Link route={`/campaigns/${this.props.address}/requests`}>
                <a>
                  <Button primary style={{ marginTop: '10px' }}>View Requests</Button>
                </a>
              </Link>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default CampaignShow;
