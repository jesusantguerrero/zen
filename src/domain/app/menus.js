import { ref, computed } from "vue";

const MENU_MODES =  {
    DAY: 'day',
    BIG_PICTURE: 'bigPicture'
}
export const useMenu = () => {
    const menus = {
      [MENU_MODES.DAY]: [{
        label: "Lineup",
        to: '/lineup'
      }, {
        label: 'Standup',
        to: '/standup'
      }, {
        label: 'Matrix',
        to: '/matrix'
      }, {
        label: 'Metrics',
        to: '/metrics'
      }, {
        label: 'Timer',
        to: '/timer'
      }],
      [MENU_MODES.BIG_PICTURE]: [
        {
          label: 'Cycles',
          to: '/cycles'
        },
        {
          label: 'Projects',
          to: '/projects'
        },
        {
          label: 'Planner',
          to: '/planner'
        },
        {
          label: 'Team',
          to: '/team'
        }
      ]

    }

    const menuMode = ref(MENU_MODES.DAY);
    const menu = computed(() => {
        return menus[menuMode.value]
    })

    const isMenuMode = (modeName) => {
        return menuMode.value == modeName
    }

    const toggleMenuMode = () => {
        menuMode.value = menuMode.value == MENU_MODES.DAY ? MENU_MODES.BIG_PICTURE : MENU_MODES.DAY
    }

    return {
        menu,
        isMenuMode,
        toggleMenuMode
    }
}