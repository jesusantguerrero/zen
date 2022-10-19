import { describe, it, expect } from "vitest"
import { render, fireEvent } from '@testing-library/vue'
import userEvent from "@testing-library/user-event"
import OauthForm from "../components/molecules/OauthForm.vue"
import "happy-dom"

const user = userEvent.setup()
describe("OauthForm", () => {
    it("should be defined", async () => {
       const { getByText, getByLabelText, emitted } = render(OauthForm)

        getByText('Oauth Form')
        await user.type(getByLabelText('Name'), 'Neatlancer')
        await user.type(getByLabelText('Description'), 'Custom budget')
        await user.type(getByLabelText('Website URL'), 'https://zenboard.app')
        await user.type(getByLabelText('Policy URL'), 'https://zenboard.app')
        await user.type(getByLabelText('Redirect URLs'), 'https://zenboard.app')
        await fireEvent.click(getByText('Save Application'))
        expect(emitted().submit[0]).toEqual([{ 
            name: 'Neatlancer', 
            description: 'Custom budget', 
            website: 'https://zenboard.app', 
            policy: 'https://zenboard.app', 
            redirect: 'https://zenboard.app' 
        }])
    })
})