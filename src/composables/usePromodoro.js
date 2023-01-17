import { reactive} from "vue";
const SESSION_MINUTES = 25;
const SHORT_BREAK_MINUTES= 5;
const LONG_BREAK_MINUTES= 15;
const PROMODORO_TEMPLATE = [
    "promodoro",
    "rest",
    "promodoro",
    "rest",
    "promodoro",
    "rest",
    "promodoro",
    "long",
]

export function usePromodoro() {
    const promodoroState = reactive({
        template: PROMODORO_TEMPLATE,
        modes: {
            long: {
              label: "Long Rest",
              min: LONG_BREAK_MINUTES,
              sec: 0,
              color: "text-green-400",
              colorBg: "bg-green-400",
              colorBorder: "border-green-400",
              text: "Long break",
            },
            promodoro: {
              min: SESSION_MINUTES,
              sec: 0,
              color: "text-red-400",
              colorBg: "bg-red-400",
              colorBorder: "border-red-400",
              text: "Pomodoro session",
            },
            rest: {
              min: SHORT_BREAK_MINUTES,
              sec: 0,
              color: "text-blue-400",
              colorBg: "bg-blue-400",
              colorBorder: "border-blue-400",
              text: "Take a short break",
            },
        },
        volume: 100,
        audio: null,
        alarmSound: 'alarmwatch'
    })

    const setSettings = (settings) => {
        if (!settings) {
            return
        }

        if (settings.promodoro_template) {
            promodoroState.template = settings.promodoro_template
        }

        promodoroState.pushSubscription = settings.pushSubscription;
        
        const modes = settings.promodoro_modes;
        const { promodoro, rest, long } = promodoroState.modes;
        
        if (modes) {
            promodoro.min = modes.promodoro.min;
            promodoro.sec = modes.promodoro.sec;
            rest.min = modes.rest.min;
            rest.sec = modes.rest.sec;
            long.min = modes.long.min;
            long.sec = modes.long.sec
        }
        promodoroState.volume = settings.promodoro_alert_volume || 100;
    }
    
    const audio = new Audio(`./audio/${promodoroState.alarmSound}.mp3`)

    const playSound = async (volume) => {
        stopSound()
        const localVolume = volume || promodoroState.volume / 100;
        audio.id = "audio"
        document.body.appendChild(audio);
        audio.currentTime = 0
        audio.volume = localVolume
        promodoroState.audio = audio
        window.navigator.vibrate([1000, 100, 1000, 100, 1000, 100, 1000]);
        return audio.play()
    }

    const stopSound = () => {
        if (promodoroState.audio && promodoroState.audio.pause) {
            promodoroState.audio.pause()
            window.navigator.vibrate(0);
        }
    }
    
    const requestNotification = () => {
        if (window.Notification && Notification.permission !== "denied") {
            return Notification.requestPermission()
        }
    } 

    const showNotification = (message) => {
        if (window.Notification && Notification.permission === "granted") {
            const notification = new Notification(message);    
        }
    }

    return {
        playSound,
        stopSound,
        setSettings,
        promodoroState,
        showNotification,
        requestNotification
    }
}
