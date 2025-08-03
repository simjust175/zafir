import GeneralService from "../Services/generalService.js";

class GeneralControllers {
    static async postGeneral({ body, params }, res) {
        console.log(body, params.db);
        
        if (!body) return res.status(400).json({ message: 'Error in GeneralServices/postGeneralService' });
        try {
            const newGeneral = await GeneralService.postService(params.db, body);
            if (!newGeneral) return res.status(404).json({ message: 'Error in GeneralServices/postGeneralService()' });
            res.status(200).json({ message: `New General added successfully`, newGeneral });
        } catch (error) {
            res.status(500).json({ message: `Error in userServices/postGeneral: ${error.message}` });
        }
    }

    static async getGenerals({ body }, res) {
        if (!body) return res.status(400).json({ message: 'Error in GeneralServices/getGeneralService' });
        try {
            const Generals = await GeneralService.getService(body);
            if (!Generals) return res.status(404).json({ message: 'Error in GeneralServices/getGeneralService' });
            res.status(200).json({ message: `Generals retrieved successfully`, Generals });
        } catch (error) {
            res.status(500).json({ message: `Error in GeneralServices/getGeneral: ${error.message}` });
        }
    };
    
    static async getFilteredGeneral(req, res) {
        try {
            const filtered = await GeneralService.getFilteredService(req);
            if (!filtered) return res.status(404).json({ message: 'Error in GeneralServices/getGeneralService' });
            res.status(200).json({ message: `filtered retrieved successfully`, filtered });
        } catch (error) {
            res.status(500).json({ message: `Error in GeneralServices/getGeneral: ${error.message}` });
        }
    };

    static async geMultipleFiltered(res) {
        //if (!body) return res.status(400).json({ message: 'Error in GeneralServices/getGeneralService' });
        try {
            const generals = await GeneralService.getMultipleFilteredService(res);
            if (!generals) return res.status(404).json({ message: 'Error in GeneralServices/getGeneralService' });
            res.status(200).json({ message: `Multiple-details retrieved successfully`, generals });
        } catch (error) {
            res.status(500).json({ message: `Error in GeneralServices/getGeneral: ${error.message}` });
        }
    }
    static async patch({ body, params, query }, res) {
        //if (!body) return res.status(400).json({ message: 'Error in GeneralServices/postGeneralService' });
        try {
            const newGeneral = await GeneralService.patchService(params.db, query, body);
            if (!newGeneral) return res.status(404).json({ message: 'Error in GeneralServices/postGeneralService()' });
            res.status(200).json({ message: `New General added successfully`, newGeneral });
        } catch (error) {
            res.status(500).json({ message: `Error in userServices/patchService: ${error.message}` });
        }
    }

}

export default GeneralControllers;