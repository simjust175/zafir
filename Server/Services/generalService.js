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
    console.log("i am being called");
    
    const columns = query.what || "*";
    let whereClause = "";
    let values = [];
  
    // Safety check: require filterField and filterValue for filtering
    if (query.filterField && query.filterValue !== undefined) {
      // Validate column name: only letters, numbers, underscores allowed
      const isValidColumn = /^[a-zA-Z0-9_]+$/.test(query.filterField);
      if (!isValidColumn) {
        throw new Error(`Invalid filterField: ${query.filterField}`);
      }
  
      whereClause = `\`${query.filterField}\` = ?`;
      values = [query.filterValue];
    }
  
    try {
      return await General.getWithFilter(params.db, columns, whereClause, values);
    } catch (err) {
      throw new Error(
        `Failed to fetch filtered records from table '${params.db}' with filter '${query.filterField}': ${err.message}`
      );
    }
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

    // If delete_both is requested, update both invoices
    if (body.delete_both) {
      const { duplicate_id, deleted_at } = body;
      if (!duplicate_id) throw new Error("duplicate_id is required for delete_both");

      // Soft delete the selected invoice
      await General.patch(table,
        { deleted_at },
        "invoice_id = ?",
        [query.id]
      );

      // Soft delete the duplicate invoice
      await General.patch(table,
        { deleted_at },
        "invoice_id = ?",
        [duplicate_id]
      );

      return { success: true, deleted: [query.id, duplicate_id] };
    }
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