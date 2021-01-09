import { Component, React } from 'react'
import { Card, List, Button, Input } from 'antd'

import crowdfundingInstance from '../eth/Crowdfunding'

//let web3 = require('../utils/InitWeb3')

class AllFundings extends Component {
    constructor() {
        super()
        this.state = {
            totalFundings: 0,
            account: 0,
            allFundingAddrList: [],
            allFundingList: [],
            fundAmount: 0
        }

        this.onFundButtonPressed = this.onFundButtonPressed.bind(this)
    }

    async componentDidMount() {
        let numOfProjects = await crowdfundingInstance.methods.numOfProjects().call();
        var list = []
        for (var i = 0; i < numOfProjects; ++i) {
            let projectDetail = await crowdfundingInstance.methods.getProject(i).call();
            list.push(projectDetail)
        }

        this.setState({
            account: this.props.account,
            totalFundings: numOfProjects,
            allFundingList: list
        })

    }

    onFundButtonPressed = (index) => {
        crowdfundingInstance.methods.contribute(index).send({
            from: this.props.account,
            gas: 1000000,
            value: this.state.fundAmount
        })
    }

    render() {
        console.log(this.state.allFundingList)
        return (
            <div>
                <List
                    bordered
                    dataSource={this.state.allFundingList}
                    renderItem={(item, index) => (
                        <List.Item>
                            <center>
                                <Card title={item.title} style={{ width: 300 }}>
                                    <p>目标资金：{item.goal}</p>
                                    <p>已经筹集：{item.amount}</p>
                                    <p>截止时间：{item.deadline / 24 / 3600}天后</p>
                                </Card>
                            </center>
                            <Input placeholder='投资资金' onChange={e => { this.setState({ fundAmount: e.target.value }) }} />
                            <Button type='primary' disabled={parseInt(item.amount) >= parseInt(item.goal)} onClick={e => { e.preventDefault(); this.onFundButtonPressed(index) }}>参与</Button>
                        </List.Item>
                    )}
                />
            </div>
        );
    }
}

export default AllFundings;