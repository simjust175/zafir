import GeneralService from "../Services/generalService.js";
import General from "../Database/Models/general.js";

class GeneralControllers {
    static async postGeneral({ body, params, app }, res) {
        console.log(body, params.db);
        
        if (!body) return res.status(400).json({ message: 'Error in GeneralServices/postGeneralService' });
        try {
            const eventSystem = app.get('eventSystem');
            const newGeneral = await GeneralService.postService(params.db, body, eventSystem);
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
    static async geMultipleFiltered(req, res) {
        try {
            const generals = await GeneralService.getMultipleFilteredService(req);
            if (!generals) return res.status(404).json({ message: 'Error in GeneralServices/getGeneralService' });
            res.status(200).json({ message: `Multiple-details retrieved successfully`, generals });
        } catch (error) {
            res.status(500).json({ message: `Error in GeneralServices/getGeneral: ${error.message}` });
        }
    }
    static async patch({ body, params, query, app }, res) {
        //if (!body) return res.status(400).json({ message: 'Error in GeneralServices/postGeneralService' });
        try {
            const eventSystem = app.get('eventSystem');
            const newGeneral = await GeneralService.patchService(params.db, query, body, eventSystem);
            if (!newGeneral) return res.status(404).json({ message: 'Error in GeneralServices/postGeneralService()' });
            res.status(200).json({ message: `New General added successfully`, newGeneral });
        } catch (error) {
            res.status(500).json({ message: `Error in userServices/patchService: ${error.message}` });
        }
    }

    static async getByProject(req, res) {
        const { db } = req.params;
        const { projectId } = req.query;
        
        if (!projectId) {
            return res.status(400).json({ message: 'projectId is required' });
        }
        
        try {
            const entries = await General.getByProject(db, parseInt(projectId));
            res.status(200).json({ entries });
        } catch (error) {
            res.status(500).json({ message: `Error fetching entries: ${error.message}` });
        }
    }

    static async deleteEntry({ params, app }, res) {
        const { db, id } = params;
        
        try {
            const eventSystem = app.get('eventSystem');
            const deleted = await General.softDelete(db, parseInt(id));
            
            if (!deleted) {
                return res.status(404).json({ message: 'Entry not found' });
            }
            
            if (eventSystem) {
                if (db === 'invoices') {
                    eventSystem.emitInvoice('delete', deleted);
                } else if (db === 'payments') {
                    eventSystem.emitPayment('delete', deleted);
                } else if (db === 'projects') {
                    eventSystem.emitProject('delete', deleted);
                }
            }
            
            res.status(200).json({ message: 'Entry deleted successfully', deleted });
        } catch (error) {
            res.status(500).json({ message: `Error deleting entry: ${error.message}` });
        }
    }
}

export default GeneralControllers;