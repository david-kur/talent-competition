import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import LoggedInBanner from '../../Layout/Banner/LoggedInBanner.jsx';
import { LoggedInNavigation } from '../../Layout/LoggedInNavigation.jsx';
import { JobSummaryCard } from './JobSummaryCard.jsx';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';
import { Pagination, Icon, Dropdown, Checkbox, Accordion, Form, Segment } from 'semantic-ui-react';

export default class ManageJob extends React.Component {
    constructor(props) {
        super(props);
        let loader = loaderData
        loader.allowedUsers.push("Employer");
        loader.allowedUsers.push("Recruiter");
        //console.log(loader)
        this.state = {
            loadJobs: [],
            loaderData: loader,
            activePage: 1,
            sortBy: {
                date: "desc"
            },
            filter: {
                showActive: true,
                showClosed: true,
                showDraft: true,
                showExpired: true,
                showUnexpired: true
            },
            totalPages: 1,
            activeIndex: "",
            limit: 6
        }
        this.loadData = this.loadData.bind(this);
        this.init = this.init.bind(this);
        //your functions go here
        this.handlePaginationChange = this.handlePaginationChange.bind(this);
        this.handleSortByDateChange = this.handleSortByDateChange.bind(this);
    };

    init() {
        let loaderData = TalentUtil.deepCopy(this.state.loaderData)
        loaderData.isLoading = false;
        this.setState({ loaderData });//comment this
        //set loaderData.isLoading to false after getting data
        //this.loadData(() =>
        //    this.setState({ loaderData })
        //)

        //console.log(this.state.loaderData)
    }

    componentDidMount() {
        this.init();
        this.loadData();
    }

    loadData(callback) {
        // your ajax call and other logic goes here
        var link = 'http://localhost:51689/listing/listing/getSortedEmployerJobs?';
        var cookies = Cookies.get('talentAuthToken');

        const { activePage, sortBy, limit } = this.state;
        const { showActive, showClosed, showDraft, showExpired, showUnexpired } = this.state.filter;
        const param = `activePage=${activePage}&sortbyDate=${sortBy.date}&showActive=${showActive}&showClosed=${showClosed}&showDraft=${showDraft}&showExpired=${showExpired}&showUnexpired=${showUnexpired}&limit=${limit}`;

        $.ajax({
            url: link + param,
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "GET",
            contentType: "application/json",
            dataType: "json",
            success: function (res) {
                if (res.success == true) {
                    const totalPages = Math.ceil(res.totalCount / limit);
                    this.setState({ loadJobs: res.myJobs, totalPages });
                } else {
                    TalentUtil.notification.show(res.message, "error", null, null);
                }
            }.bind(this)
        })
    }

    handlePaginationChange(e, { activePage }) {
        this.setState({ activePage }, () => this.loadData());
    }

    handleSortByDateChange(e, { value }) {
        const sortBy = Object.assign({}, this.state.sortBy)
        sortBy.date = value;
        this.setState({ sortBy }, () => this.loadData());
    }

    render() {
        const jobsData = this.state.loadJobs.length === 0 ? <p>No Jobs Found</p> : this.state.loadJobs.map(job => <JobSummaryCard key={job.id} job={job} />)
        const { activePage, totalPages } = this.state;
        const dateOptions = [
            { key: 'desc', value: 'desc', text: 'Newest first' },
            { key: 'asc', value: 'asc', text: 'Oldest first' }
        ];
        const filterOptions = [
            { key: 'Active', value: 'Active', text: 'Active' },
            { key: 'Closed', value: 'Closed', text: 'Closed' },
            { key: 'Draft', value: 'Draft', text: 'Draft' },
            { key: 'Expired', value: 'Expired', text: 'Expired' },
            { key: 'Unexpired', value: 'Unexpired', text: 'Unexpired' },
        ];

        return (
            <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>
                <div className="ui container">
                    <div>
                        <h3>List of Jobs</h3>
                        <div>
                            <Icon name='filter' /><span className="text">Filter: </span>
                            <Dropdown inline text='Choose filter' options={filterOptions} />
                            <Icon name='calendar alternate' /><span>Sort by date: </span>
                            <Dropdown inline defaultValue={dateOptions[0].value} options={dateOptions} onChange={this.handleSortByDateChange} />
                        </div>
                    </div>
                    <br />
                    <div className="ui three stackable cards">
                        {jobsData}
                    </div>
                    <Segment basic textAlign='center'>
                        <Pagination activePage={activePage} totalPages={totalPages} onPageChange={this.handlePaginationChange} />
                    </Segment>
                </div>
            </BodyWrapper >
        )
    }
}