import type {
  Query,
  FilterQuery,
  PopulateOptions,
  PopulateOptions as MongoosePopulateOptions,
} from "mongoose";

// Shape of the raw query-string object coming from req.query / searchParams
export interface ApiQueryString {
  [key: string]: unknown;
  page?: string | number;
  sort?: string;
  limit?: string | number;
  fields?: string;
}

/**
 * Generic utility for applying API query features (filter, sort, fields, paginate, populate)
 * to a Mongoose Query.
 *
 * T = document interface (e.g., IEvent)
 */
class APIFeatures<T> {
  public query: Query<T[], T>;
  public queryString: ApiQueryString;

  constructor(query: Query<T[], T>, queryString: ApiQueryString) {
    this.query = query;
    this.queryString = queryString;
  }

  public filter(): this {
    // Create a shallow clone so we can safely delete keys
    const queryObj: Record<string, unknown> = { ...this.queryString };

    this.removeExcludedFields(queryObj);

    let queryStr = JSON.stringify(queryObj);

    // Convert gte/gt/lte/lt to MongoDB operators: $gte/$gt/$lte/$lt
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const mongoFilter = JSON.parse(queryStr) as FilterQuery<T>;

    this.query = this.query.find(mongoFilter);
    return this;
  }

  private removeExcludedFields(query: Record<string, unknown>): void {
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((field) => {
      delete query[field];
    });
  }

  /**
   * Apply sorting.
   * - If `this.queryString.sort` exists, use that (comma-separated → space-separated).
   * - Otherwise, use provided `defaultSort` (e.g., "-_id").
   */
  public sort(defaultSort: string = "-_id"): this {
    if (this.queryString.sort) {
      const sortBy = (this.queryString.sort as string).split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort(defaultSort);
    }
    return this;
  }

  /**
   * Limit selected fields.
   * - If `fields` is present, pick those fields.
   * - Otherwise, exclude `__v`.
   */
  public limitFields(): this {
    if (this.queryString.fields) {
      const fields = (this.queryString.fields as string).split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  /**
   * Basic pagination.
   * - page: 1-based
   * - limit: items per page
   */
  public paginate(): this {
    const pageRaw = this.queryString.page;
    const limitRaw = this.queryString.limit;

    const page = pageRaw ? Number(pageRaw) : 1;
    const limit = limitRaw ? Number(limitRaw) : 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  /**
   * Optional population.
   *
   * Accepts:
   *  - string
   *  - PopulateOptions
   *  - array of string / PopulateOptions
   */
  public populate(
    populateOptions?: string | PopulateOptions | (string | PopulateOptions)[]
  ): this {
    if (populateOptions) {
      this.query = this.query.populate(
        populateOptions as MongoosePopulateOptions
      );
    }
    return this;
  }
}

export default APIFeatures;
