
import { z } from "zod";

const nameRegex = /^[a-zA-Z\s]+$/;
const hotelNameRegex = /^[a-zA-Z0-9\s\-&,]+$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Reusable error handlers
const requiredString = (field: string) =>
    z.string({
        error: (issue) =>
            issue.input === undefined
                ? `${field} is required`
                : `${field} must be a string`,
    });

const requiredNumber = (field: string, typeMessage: string) =>
    z.number({
        error: (issue) =>
            issue.input === undefined
                ? `${field} is required`
                : typeMessage,
    });

// Hotel name
const hotelName = requiredString("Hotel name")
    .min(3, "Hotel name must be at least 3 characters")
    .max(100, "Hotel name must be less than 100 characters")
    .regex(
        hotelNameRegex,
        "Hotel name contains invalid characters (letters, numbers, spaces, -, &, , only)"
    );

// Description
const description = requiredString("Description")
    .min(10, "Description must be at least 10 characters")
    .max(3000, "Description must be less than 3000 characters");

// Address
const address = requiredString("Address")
    .min(5, "Address must be at least 5 characters")
    .max(100, "Address must be less than 100 characters");

// State
const state = requiredString("State")
    .max(20, "State must be at most 20 characters")
    .regex(nameRegex, "State must contain only letters and spaces");

// City
const city = requiredString("City")
    .max(20, "City must be at most 20 characters")
    .regex(nameRegex, "City must contain only letters and spaces");

// Time
const time = requiredString("Time")
    .regex(timeRegex, "Invalid time format (HH:mm, 24-hour)");

// Minimum guest age
const minGuestAge = requiredNumber(
    "Minimum guest age",
    "Guest age must be a number"
)
    .min(18, "Guest age must be at least 18")
    .max(100, "Guest age seems invalid");

// Boolean fields
const booleanField = z.preprocess(
    (val) => val === "true" ? true : val === "false" ? false : val,
    z.boolean({
        error: "Must be a boolean",
    })
);

// Special notes
const notes = requiredString("Special notes")
    .min(10, "Special notes must be at least 10 characters")
    .max(3000, "Special notes must be less than 3000 characters");

// JSON array parser
const parseJson = (val: unknown) =>
    typeof val === "string" ? JSON.parse(val) : val;

// Geo location
const geoLocation = z.preprocess(
    parseJson,
    z.tuple([
        z.number({ error: "Latitude must be a number" }),
        z.number({ error: "Longitude must be a number" }),
    ])
);

// Amenities
const amenities = z.preprocess(
    parseJson,
    z.array(z.string()).min(1, "At least one amenity is required")
);

// Tags
const tags = z.preprocess(
    parseJson,
    z.array(z.string()).default([])
);

// Rating
const rating = z
    .number({ error: "Rating must be a number" })
    .min(0, "Rating must be at least 0")
    .max(5, "Rating cannot exceed 5");

// Create hotel
export const createHotelSchema = z.object({
    name: hotelName,
    description,
    address,
    state,
    city,
    checkInTime: time,
    checkOutTime: time,
    minGuestAge,
    petsAllowed: booleanField,
    outsideFoodAllowed: booleanField,
    specialNotes: notes,
    amenities,
    tags,
    geoLocation,
    rating: rating.optional(),
}).strict();

// Update hotel
export const updateHotelSchema = z
    .object({
        name: hotelName.optional(),
        description: description.optional(),
        address: address.optional(),
        state: state.optional(),
        city: city.optional(),
        checkInTime: time.optional(),
        checkOutTime: time.optional(),
        minGuestAge: minGuestAge.optional(),
        petsAllowed: booleanField.optional(),
        outsideFoodAllowed: booleanField.optional(),
        specialNotes: notes.optional(),

        amenities: amenities.optional(),

        tags: z
            .preprocess(
                parseJson,
                z.array(z.string())
            )
            .optional(),

        geoLocation: geoLocation.optional(),

        rating: z
            .preprocess(
                (val) => val !== undefined ? Number(val) : val,
                rating
            )
            .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update",
    });
