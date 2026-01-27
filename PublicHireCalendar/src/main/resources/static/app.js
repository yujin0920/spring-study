const CATEGORY_COLORS = {
    apply: "#2f80ed",
    test: "#f2994a",
    interview: "#9b51e0",
    result: "#27ae60",
};

const scheduleEvents = [
    {
        title: "한국전력공사 서류 접수",
        start: "2026-01-05",
        end: "2026-01-13",
        category: "apply",
    },
    {
        title: "한국도로공사 필기전형",
        start: "2026-01-17",
        category: "test",
    },
    {
        title: "국민건강보험공단 면접",
        start: "2026-01-20",
        end: "2026-01-22",
        category: "interview",
    },
    {
        title: "한국수자원공사 최종 발표",
        start: "2026-01-27",
        category: "result",
    },
    {
        title: "한국철도공사 서류 접수",
        start: "2026-02-02",
        end: "2026-02-09",
        category: "apply",
    },
    {
        title: "근로복지공단 필기전형",
        start: "2026-02-14",
        category: "test",
    },
    {
        title: "한국전력거래소 면접",
        start: "2026-02-19",
        category: "interview",
    },
    {
        title: "한국가스공사 최종 발표",
        start: "2026-02-25",
        category: "result",
    },
];

const today = new Date();
const todayISO = getLocalISODate(today);

const calendarEl = document.getElementById("calendar");
const monthSummaryEl = document.getElementById("monthSummary");
const todayDateEl = document.getElementById("todayDate");
const todayChecklistEl = document.getElementById("todayChecklist");
const nextEventEl = document.getElementById("nextEvent");

todayDateEl.textContent = today.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
});

const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    height: "auto",
    fixedWeekCount: false,
    dayMaxEvents: true,
    headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek",
    },
    buttonText: {
        today: "오늘",
        month: "월간",
        week: "주간",
    },
    events: scheduleEvents.map((event) => ({
        ...event,
        backgroundColor: CATEGORY_COLORS[event.category],
        borderColor: "transparent",
    })),
    eventContent: (arg) => {
        const dot = document.createElement("span");
        dot.className = "event-chip__dot";

        const label = document.createElement("span");
        label.textContent = arg.event.title;

        const wrapper = document.createElement("span");
        wrapper.className = "event-chip";
        wrapper.style.background = CATEGORY_COLORS[arg.event.extendedProps.category];
        wrapper.append(dot, label);

        return { domNodes: [wrapper] };
    },
    datesSet: (info) => {
        updateMonthlySummary(info.start, info.end);
        updateNextEvent();
        updateTodayChecklist();
    },
});

calendar.render();

function updateMonthlySummary(startDate, endDate) {
    const monthEvents = scheduleEvents.filter((event) => {
        const eventStart = new Date(event.start);
        return eventStart >= startDate && eventStart < endDate;
    });

    if (monthEvents.length === 0) {
        monthSummaryEl.textContent = "이번 달 일정이 없습니다.";
        return;
    }

    const grouped = monthEvents.reduce((acc, event) => {
        acc[event.category] = (acc[event.category] || 0) + 1;
        return acc;
    }, {});

    monthSummaryEl.textContent = [
        `서류 ${grouped.apply || 0}건`,
        `필기 ${grouped.test || 0}건`,
        `면접 ${grouped.interview || 0}건`,
        `발표 ${grouped.result || 0}건`,
    ].join(" · ");
}

function updateTodayChecklist() {
    const todayEvents = scheduleEvents.filter((event) => {
        if (!event.end) {
            return event.start === todayISO;
        }
        return todayISO >= event.start && todayISO < event.end;
    });

    todayChecklistEl.innerHTML = "";

    if (todayEvents.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.textContent = "오늘 일정이 없습니다.";
        todayChecklistEl.append(emptyItem);
        return;
    }

    todayEvents.forEach((event) => {
        const item = document.createElement("li");
        const label = event.title.replace(/(서류 접수|필기전형|면접|최종 발표)/, "— $1");
        item.textContent = label;
        todayChecklistEl.append(item);
    });
}

function updateNextEvent() {
    const startOfToday = new Date(`${todayISO}T00:00:00`);
    const upcoming = scheduleEvents
        .map((event) => ({ ...event, startDate: new Date(event.start) }))
        .filter((event) => event.startDate >= startOfToday)
        .sort((a, b) => a.startDate - b.startDate)[0];

    if (!upcoming) {
        nextEventEl.textContent = "예정된 일정이 없습니다.";
        return;
    }

    nextEventEl.textContent = `${upcoming.title} · ${formatDate(upcoming.startDate)}`;
}

function formatDate(date) {
    return date.toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "short",
    });
}

function getLocalISODate(date) {
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return offsetDate.toISOString().slice(0, 10);
}
