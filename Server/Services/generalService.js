import General from "../Database/Models/general.js";

class GeneralService {
  static async postService(table, body) {
    if (!table || !body) throw new Error("Database and body must be provided");
    return await General.post(table, body);
  }

  static async getService({ params }) {
    if (!params.db) throw new Error("Database name is required");
    return await General.get(params.db);
  }

  static async getFilteredService({ params, query }) {
    const columns = query.what || "*";
    const whereClause = query.where || "";
    return await General.getWithFilter(params.db, columns, whereClause);
  }

  static async getMultipleFilteredService({ params, query }) {
    const columns = query.what || "*";
    const filterField = query.filterField || "id";
    const filterValues = query.filterValues || [];
    return await General.getMultipleFilteredGroups(params.db, columns, filterField, filterValues);
  }

  static async patchService(table, query, body) {
    if (!table || !body) throw new Error("Database and body must be provided");
    console.log("table", table, "query", query);
    
    let whereClause = "";
    let params = [];

    if (query.id) { 
      whereClause = "invoice_id = ?";
      params = [query.id];
    } else if (query.user) {
      whereClause = "user_id = ?";
      params = [query.user];
    } else if (query.margin) {
      const [proj, issuer] = JSON.parse(query.margin);
      whereClause = "project = ? AND issuer = ?";
      params = [proj.project, issuer.issuer];
    } else if (query.project) {
      whereClause = "project_id = ?";
      params = [query.project];
    } else if (query.allWarnings) {
      console.log("in allWarnings");
      whereClause = "conflict_resolved IS NULL";
    } else {
      throw new Error("Valid query must be provided for patch");
    }

    return await General.patch(table, body, whereClause, params);
  }
}

export default GeneralService;