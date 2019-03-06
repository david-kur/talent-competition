import React from 'react';
import Cookies from 'js-cookie';
import { Popup, Card, Label, Icon, Modal, Button } from 'semantic-ui-react';
import moment from 'moment';

export class JobSummaryCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = { open: false };
        this.selectJob = this.selectJob.bind(this);
        this.editJob = this.editJob.bind(this);
        this.close = this.close.bind(this);
        this.show = this.show.bind(this);
    }

    // Close job confirmation modal
    close() { this.setState({ open: false }) }
    show() { this.setState({ open: true }) }

    // Edit or Update job
    editJob(id) {
        window.location = "/EditJob/" + id;
    }

    // Close job
    selectJob(id) {
        this.close();
        var link = 'http://localhost:51689/listing/listing/closeJob';
        var cookies = Cookies.get('talentAuthToken');
        $.ajax({
            url: link,
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(id),
            success: function (res) {
                TalentUtil.notification.show(res.message, "success", null, null);
            },
            error: function (res) {
                TalentUtil.notification.show(res.message, "error", null, null);
            }
        });
    }

    render() {
        const { job } = this.props;

        // State and name for close job button
        const jobClosedState = job.status === 1 ? true : false;
        const jobClosedButtonName = job.status === 1 ? 'Closed' : 'Close';

        // Different colour for days left to expiry date
        const diff = moment(job.expiryDate).diff(moment(), 'days');
        let daysColor = 'green';
        let daysText = `${diff} days left`;
        if (diff < 0) {
            daysColor = "red";
            daysText = "Expired";
        }
        else if (diff <= 1) {
            daysColor = "orange";
            daysText = "Last day";
        }
        else if (diff < 7) {
            daysColor = "yellow";
        }

        //Added height style for card in MarsTheme.css file
        return (
            <React.Fragment>
                <Card>
                    <Card.Content>
                        <Card.Header>{job.title}</Card.Header>
                        <Label color="black" ribbon="right"><Icon name="user" />0</Label>
                        <Card.Meta>{`${job.location.city}, ${job.location.country}`}</Card.Meta>
                        <Card.Description>{job.summary}</Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                        <Label color={daysColor} floated="left" size="medium">{daysText}</Label>
                        <Button basic size="mini" floated="right" color="blue">
                            <Icon name="copy outline" />Copy
                    </Button>
                        <Button basic size="mini" floated="right" color="blue" onClick={() => this.editJob(job.id)}>
                            <Icon name="edit" />Edit
                    </Button>
                        <Button basic size="mini" floated="right" color="blue" disabled={jobClosedState} onClick={this.show}>
                            <Icon name="ban" />{jobClosedButtonName}
                        </Button>
                    </Card.Content>
                </Card>
                <Modal size="tiny" open={this.state.open} onClose={this.close} dimmer="blurring" closeOnEscape={false} closeOnDimmerClick={false}>
                    <Modal.Header>Close Job</Modal.Header>
                    <Modal.Content>
                        <p>Are you sure you want to close this job?</p>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button negative onClick={this.close}>No</Button>
                        <Button positive icon="checkmark" labelPosition="right" content="Yes" onClick={() => this.selectJob(job.id)} />
                    </Modal.Actions>
                </Modal>
            </React.Fragment>
        )
    }
}