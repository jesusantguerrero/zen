import { describe, it } from "vitest"
import { render } from '@testing-library/vue'
import CardButton from "../components/molecules/CardButton.vue"

describe("CardButton", () => {
    it("should be defined", () => {
       const { getByText } = render(CardButton, {
            props: {
                title: 'Plan Ahead',
                description: 'Plan ahead and see how your business will perform over time.',
            }
        })

        getByText('Plan Ahead')
        getByText('Plan ahead and see how your business will perform over time.')
    })
})