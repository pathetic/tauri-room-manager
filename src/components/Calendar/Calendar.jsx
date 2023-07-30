import { useState, useEffect } from "react"
import FullCalendar from '@fullcalendar/react'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import interactionPlugin from '@fullcalendar/interaction'
import { Popover } from 'bootstrap'
import { Loading } from '../Loading/Loading'
import { Alert } from 'react-bootstrap'

import { invoke } from "@tauri-apps/api/tauri";

import './Calendar.css'

let popoverInstance = null;

const STATUS_DICTIONARY = {
    "Reserved": "#343a40",
    "Arrived": "#0d6efd",
    "Left": "#198754",
    "Cancelled": "#dc3545"
}

const STATUS_COLORS = {
    "Reserved": "dark",
    "Arrived": "primary",
    "Left": "success",
    "Cancelled": "danger"
}

export const Calendar = () => {
    const [bookings, setBookings] = useState([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [visibleMessage, setVisibleMessage] = useState(false);
    const [loading, setLoading] = useState(true);

    const updateBookings = async () => {
        setLoading(true);

        let bookings = await invoke("get_all_bookings", {});

        setBookings(bookings);
        setLoading(false);
        setVisibleMessage(false)
    }

    useEffect(() => {
        updateBookings()
    }, [])

    const handleMouseEnter = (info) => {
        if (info.event.extendedProps.description) {
            popoverInstance = new Popover(info.el, {
                html: true,
                title: info.event.title + `<span class="badge badge-${STATUS_COLORS[info.event.extendedProps.status]}">${info.event.extendedProps.status}</span>`,
                content: info.event.extendedProps.description,
                placement: "top",
                trigger: "hover",
                container: "body",
            });
            popoverInstance.show();
        }
    };

    const handleMouseLeave = (info) => {
        if (popoverInstance) {
            popoverInstance.dispose();
            popoverInstance = null;
        }
    };

    return !loading ? (

        <div id="calendar" >
            <FullCalendar
                locale={'en'}
                schedulerLicenseKey={'GPL-My-Project-Is-Open-Source'}
                plugins={[resourceTimelinePlugin, interactionPlugin]}
                initialView="resourceTimelineMonth"
                headerToolbar={{
                    left: 'title',
                    center: '',
                    right: 'prev,next'
                }}
                height={'auto'}
                aspectRatio="2.59"
                resourceAreaHeaderContent={'Rooms'}
                resourceGroupField='Building'
                resourceAreaWidth={150}
                resources={[
                    { id: 1, title: 'Apartment 1', building: 'Building 1' },
                    { id: 2, title: 'Apartment 2', building: 'Building 2' },
                    { id: 101, title: '101', building: 'Building 2' },
                    { id: 102, title: '102', building: 'Building 2' },
                    { id: 103, title: '103', building: 'Building 2' },
                    { id: 104, title: '104', building: 'Building 2' },
                    { id: 105, title: '105', building: 'Building 2' },
                    { id: 106, title: '106', building: 'Building 2' },
                    { id: 107, title: '107', building: 'Building 2' },
                    { id: 108, title: '108', building: 'Building 2' },
                    { id: 109, title: '109', building: 'Building 2' },
                    { id: 110, title: '110', building: 'Building 2' },

                ]}

                displayEventTime={false}
                displayEventEnd={false}

                events={bookings.map(booking => ({
                    id: booking._id,
                    title: booking.title,
                    description: booking.description,
                    status: booking.status,
                    resourceId: booking.resource_id,
                    start: booking.start + "T01:00:00",
                    end: booking.end + "T01:00:00",
                    backgroundColor: STATUS_DICTIONARY[booking.status],
                    borderColor: STATUS_DICTIONARY[booking.status],
                }))}

                resourceOrder={['1', '2', '101', '102', '103', '104', '105', '106', '107', '108', '109', '110']}

                eventMouseEnter={handleMouseEnter}
                eventMouseLeave={handleMouseLeave}

                editable={false}
            />
        </div>
    ) :
        (
            <>
                <div id="table">
                    <Alert show={visibleMessage} id="alert" key={messageType} variant={messageType}>
                        {message}
                    </Alert>
                </div>

                <Loading />
            </>
        )
}