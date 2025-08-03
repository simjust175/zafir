import General from "../Database/Models/general.js";
import AmountService from "../Services/amountService.js";

class AmountControllers {
    static async postAmount({ body }, res) {
        if (!body) return res.status(400).json({ message: 'Email must be provided' });
        try {
            const newAmount = await AmountService.postService(body);
            if (!newAmount) return res.status(404).json({ message: 'Error in AmountServices/postAmountService()' });
            res.status(200).json({ message: `New Amount added successfully`, newAmount });
        } catch (error) {
            res.status(500).json({ message: `Error in userServices/postAmount: ${error.message}` });
        }
    }
    static async postNewEmail({ body }, res) {
        const doesEmailExist = await General.getWithFilter('emails', 'email', `email = "${body.email}"`);
        console.log("does this email exists?", doesEmailExist);
        
        if (!body) return res.status(400).json({ message: 'Email must be provided' });
        if (doesEmailExist.length > 0) return res.status(400).json({ message: 'Email already exists' });
        try {
            const newAmount = await AmountService.postNewEmailService(body);
            if (!newAmount) return res.status(404).json({ message: 'Error in AmountServices/postAmountService()' });
            res.status(200).json({ message: `New Amount added successfully`, newAmount });
        } catch (error) {
            res.status(500).json({ message: `Error in userServices/postAmount: ${error.message}` });
        }
    }

    static async postToExitingEmail({ body }, res) {
        if (!body) return res.status(400).json({ message: 'Email must be provided' });
        try {
            const postedToExisting = await AmountService.postNewEmailService(body);
            if (!postedToExisting) return res.status(404).json({ message: 'Error in AmountServices/postAmountService()' });
            res.status(200).json({ message: `New Amount added successfully`, postedToExisting });
        } catch (error) {
            res.status(500).json({ message: `Error in userServices/postAmount: ${error.message}` });
        }
    }

    static async getAmounts({ body }, res) {
        if (!body) return res.status(400).json({ message: 'Error in amountServices/getAmountService' });
        try {
            const amounts = await AmountService.getService(body);
            
            if (!amounts) return res.status(404).json({ message: 'Error in AmountServices/getAmountService' });
            res.status(200).json({ message: `Amounts retrieved successfully`, amounts });
        } catch (error) {
            res.status(500).json({ message: `Error in amountServices/getAmount: ${error.message}` });
        }
    }

    static async getFreeEmails(req, res) {
        try {
            const freeEmails = await AmountService.getEmailsNotConnectedToProjects();
            res.status(200).json({ message: `freeEmails retrieved successfully`, freeEmails });
        } catch (error) {
            res.status(500).json({ message: `Error in freeEmailServices/getFeeEmails: ${error.message}` });
        }
    }

    static async getPayments(req, res) { //{params}
        try {
            const payments = await AmountService.getPaymentService(); //params.db
            res.status(200).json({ message: `payments retrieved successfully`, payments });
        } catch (error) {
            res.status(500).json({ message: `Error in freeEmailServices/getFeeEmails: ${error.message}` });
        }
    }
}

export default AmountControllers;
