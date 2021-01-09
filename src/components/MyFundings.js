import { Component, React } from 'react'
import { Card, List, Button, Input, Modal, Divider } from 'antd'
import crowdfundingInstance from '../eth/Crowdfunding'

let web3 = require('../utils/InitWeb3')
class MyFundings extends Component {
    constructor() {
        super()
        this.state = {
            account: 0,
            allFundingAddrList: [],
            allFundingList: [],
            myFundingList: [],
            myCreation: {},
            myCreationNum: 0,
            launchFunding: {
                title: '',
                goal: 0,
                deadline: 0 //days in the input and seconds here
            },
            launchVote: {
                title: '',
                usage: 0,
                deadline: 0//days in the input and seconds here
            },
            showVoteModal: false
        }

        this.onFundButtonPressed = this.onFundButtonPressed.bind(this)
        this.onCreateProject = this.onCreateProject.bind(this)
        this.handleVoteCanceled = this.handleVoteCanceled.bind(this)
        this.handleVoteOk = this.handleVoteOk.bind(this)
    }

    async componentDidMount() {
        this.setState({ account: this.props.account })
        let numOfProjects = await crowdfundingInstance.methods.numOfProjects().call();
        var list = []
        for (var i = 0; i < numOfProjects; ++i) {
            let projectDetail = await crowdfundingInstance.methods.getProject(i).call();
            if (projectDetail['owner'] == this.props.account) {
                this.setState({
                    myCreation: projectDetail,
                    myCreationNum: i
                })
            }
            for (var j = 0; j < projectDetail['numOfFunders']; ++j) {
                let funderDetail = await crowdfundingInstance.methods.getFunder(i, j).call();
                console.log(funderDetail[0])
                if (funderDetail[0] == this.props.account) {
                    list.push(projectDetail)
                }
            }
        }
        this.setState({
            myFundingList: list
        })

    }

    onFundButtonPressed = () => {

    }

    handleVoteOk = (pid, title, usage, deadline) => {
        crowdfundingInstance.methods.launchVote(pid, title, usage, deadline).send({
            from: this.props.account,
            gas: 1000000
        })
        this.setState({ showVoteModal: false })
    }

    handleVoteCanceled = () => {
        this.setState({ showVoteModal: false })
    }

    onCreateProject = () => {
        crowdfundingInstance.methods.createProject(
            this.state.launchFunding.title,
            this.state.launchFunding.goal,
            this.state.launchFunding.deadline).send({
                from: this.props.account,
                gas: 300000
            })
    }

    render() {
        console.log(this.state.myCreation)
        return (
            <div>
                <Divider>我发起的项目</Divider>
                <div>
                    <Card title={this.state.myCreation.title} style={{ width: 300 }}></Card>
                    <Button type='primary'
                        onClick={e => { e.preventDefault(); this.setState({ showVoteModal: true }) }}
                        disabled={JSON.stringify(this.state.myCreation) === "{}"}>
                        发起使用请求
                    </Button>
                    <Modal
                        title='发起使用申请'
                        visible={this.state.showVoteModal}
                        onOk={this.handleVoteOk}
                        onCancel={this.handleVoteCanceled}>
                        <Input placeholder='使用原因' onChange={e => {
                            this.setState(prevState => ({
                                launchVote: {
                                    ...prevState.launchVote,
                                    ['title']: e.target.value
                                }
                            }))
                        }} />
                        <Input placeholder='使用量' onChange={e => {
                            this.setState(prevState => ({
                                launchVote: {
                                    ...prevState.launchVote,
                                    ['usage']: e.target.value
                                }
                            }))
                        }} />
                        <Input placeholder='投票截止时间（天）' onChange={e => {
                            this.setState(prevState => ({
                                launchVote: {
                                    ...prevState.launchVote,
                                    ['deadline']: e.target.value * 24 * 3600
                                }
                            }))
                        }} />
                    </Modal>
                </div>
                <Divider>我参与的项目</Divider>
                <List
                    bordered
                    dataSource={this.state.myFundingList}
                    renderItem={item => (
                        <List.Item>
                            <Card title={item.title} style={{ width: 300 }}>
                                {item.title}
                            </Card>
                            <Button type='primary'
                                onClick={e => { e.preventDefault(); this.onFundButtonPressed(item) }}
                                disabled={!item.isVoting}>
                                投票
                            </Button>
                        </List.Item>
                    )}
                />
                <Divider>发起项目</Divider>
                <Input placeholder='众筹标题' onChange={e => {
                    this.setState(prevState => ({
                        launchFunding: {
                            ...prevState.launchFunding,
                            ['title']: e.target.value
                        }
                    }))
                }} />
                <Input placeholder='目标资金' onChange={e => {
                    this.setState(prevState => ({
                        launchFunding: {
                            ...prevState.launchFunding,
                            ['goal']: e.target.value
                        }
                    }))
                }} />
                <Input placeholder='时间限制（天数）' onChange={e => {
                    this.setState(prevState => ({
                        launchFunding: {
                            ...prevState.launchFunding,
                            ['deadline']: e.target.value * 24 * 3600
                        }
                    }))
                }} />
                <Button type='primary' onClick={e => { e.preventDefault(); this.onCreateProject(); }}>创建众筹</Button>
            </div>
        )
    }
}

export default MyFundings;