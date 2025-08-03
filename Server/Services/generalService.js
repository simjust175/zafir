import General from "../Database/Models/general.js";

class GeneralService {
  static async postService(db, body) {
    console.log("in controllers: ---", db, body);
    
    if (!db || !body)
      throw new Error("⚠️ Service/postService.js - Need to define database");
    try {
      const postAmount = await General.post(db, body);
      if (!postAmount) return null;
      return postAmount;
    } catch (error) {
      throw new Error(`in Services/postService: ${error.message}`);
    }
  }

  static async getService({ params }) {
    // const [{user_id}] = await general.ValidateByToken(token);
    // if (!user_id) throw new Error("not the correct user");
    if (!params.db)
      throw new Error("⚠️ Service/getService.js - Need to define database");
    try {
      const getAmounts = await General.get(params.db); //user_id
      if (!getAmounts) return null;
      return getAmounts;
    } catch (error) {
      throw new Error(`error in generalService/getService: ${error.message}`);
    }
  }

  static async getFilteredService({ params, query }) {
    const what = query.what || "*";
    const where = query.where || "";
    console.log("query", query, !query, where, "||");
    
    if (!params.db)
      throw new Error("⚠️ Service/getService.js - Need to define database");
    try {
      const getAmounts = await General.getWithFilter(
        params.db,
        what,
        where
      ); //user_id
      if (!getAmounts) return null;
      return getAmounts;
    } catch (error) {
      throw new Error(`error in generalService/getService: ${error.message}`);
    }
  }
  static async getMultipleFilteredService({ params, query }) {
    const what = query.what || "*";
    const where = `${query.where}` || "";
    if (!params.db)
      throw new Error("⚠️ Service/getService.js - Need to define database");
    try {
      const getAmounts = await General.getMultipleFilteredGroups(
        params.db,
        what,
        where,
        query.filterValues
      ); //user_id
      if (!getAmounts) return null;
      return getAmounts;
    } catch (error) {
      throw new Error(`error in generalService/getService: ${error.message}`);
    }
  }

  static async patchService(db, query, body) {
    console.log(query, body);
    
    if (!body || !db) {
      throw new Error("⚠️ patchService - body, and db must be provided.");
    }
    let whereClause = "";
    if (Object.keys(body).includes('btwPercent')) {
      console.log("includes");
      
    } else{
      console.log("excluded!");
    }
    if (query.id) {
      whereClause = "invoice_id = ?";
      // whereParams.push(query.id);
    } else if (query.margin) {
      const q = JSON.parse(query.margin)
      console.log("is it iterable?", q);
      whereClause = `project = ${q[0].project} AND issuer = "${q[1].issuer}"`;
    }  else if (query.project) {
      const q = JSON.parse(query.project)
      console.log("is it iterable?", q);
      whereClause = `project_id = ${query.project}`;
    } else {
      throw new Error("⚠️ patchService - valid query must be provided.");
    }

    try {
      const result = await General.patch(db, body, whereClause, query.id);
      return result;
    } catch (err) {
      throw new Error("🔴 patchService Error: " + err.message);
    }
  }
}

export default GeneralService;
