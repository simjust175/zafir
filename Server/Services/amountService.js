import Amount from "../Database/Models/Amount.js";

class AmountService {
    static async postService(body) {
        console.log("BODY", body);
        try {
            const postAmount = await Amount.postAmount(body);
            if (!postAmount) return null;
            return postAmount;
        } catch (error) {
            throw new Error(`in Services/postService: ${error.message}`);
        }
    }

    static async getService({token}) {
        const [{user_id}] = await Amount.ValidateByToken(token);
        if (!user_id) throw new Error("not the correct user");
        try {
            const getAmounts = await Amount.GetAmounts(user_id);
            if (!getAmounts) return null;
            return getAmounts;
        } catch (error) {
            throw new Error(`error in amountService/getService: ${error.message}`);
        }
    }
}

export default AmountService;
