import General from "../Database/Models/general.js";
import AmountService from "../Services/amountService.js";

class AmountControllers {
    static async postAmount({ body }, res) {
        if (!body) return res.status(400).json({ msg: 'Error in amountServices/postAmountService' });
        try {
            const newAmount = await AmountService.postService(body);
            if (!newAmount) return res.status(404).json({ msg: 'Error in AmountServices/postAmountService()' });
            res.status(200).json({ Success: `New Amount added successfully`, newAmount });
        } catch (error) {
            res.status(500).json({ Error: `Error in userServices/postAmount: ${error.message}` });
        }
    }
    static async postNewEmail({ body }, res) {
        if (!body) return res.status(400).json({ msg: 'Error in amountServices/postAmountService' });
        try {
            const newAmount = await AmountService.postNewEmailService(body);
            if (!newAmount) return res.status(404).json({ msg: 'Error in AmountServices/postAmountService()' });
            res.status(200).json({ Success: `New Amount added successfully`, newAmount });
        } catch (error) {
            res.status(500).json({ Error: `Error in userServices/postAmount: ${error.message}` });
        }
    }
    static async postToExitingEmail({ body }, res) {
        if (!body) return res.status(400).json({ msg: 'Error in amountServices/postAmountService' });
        try {
            const postedToExisting = await AmountService.postToExitingEmail(body);
            if (!postedToExisting) return res.status(404).json({ msg: 'Error in AmountServices/postAmountService()' });
            res.status(200).json({ Success: `New Amount added successfully`, postedToExisting });
        } catch (error) {
            res.status(500).json({ Error: `Error in userServices/postAmount: ${error.message}` });
        }
    }

    static async getAmounts({ body }, res) {
        if (!body) return res.status(400).json({ msg: 'Error in amountServices/getAmountService' });
        try {
            const amounts = await AmountService.getService(body);
            
            if (!amounts) return res.status(404).json({ msg: 'Error in AmountServices/getAmountService' });
            res.status(200).json({ Success: `Amounts retrieved successfully`, amounts });
        } catch (error) {
            res.status(500).json({ Error: `Error in amountServices/getAmount: ${error.message}` });
        }
    }

    static async getFreeEmails(req, res) {
        try {
            const freeEmails = await AmountService.getEmailsNotConnectedToProjects();
            res.status(200).json({ Success: `freeEmails retrieved successfully`, freeEmails });
        } catch (error) {
            res.status(500).json({ Error: `Error in freeEmailServices/getFeeEmails: ${error.message}` });
        }
    }

    static async getPayments(req, res) { //{params}
        try {
            const payments = await AmountService.getPaymentService(); //params.db
            res.status(200).json({ Success: `payments retrieved successfully`, payments });
        } catch (error) {
            res.status(500).json({ Error: `Error in freeEmailServices/getFeeEmails: ${error.message}` });
        }
    }
}

export default AmountControllers;
