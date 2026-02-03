import z from "zod";

const nameRegex = /^[a-zA-Z\s]+$/;
const hotelNameRegex = /^[a-zA-Z0-9\s\-&,]+$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const hotelName = z.string({
    required_error: "Hotel name is required",
    invalid_type_error: "Hotel name must be a string",
})
    .min(3, "Hotel name must be at least 3 characters")
    .max(100, "Hotel name must be less than 100 characters")
    .regex(
        hotelNameRegex,
        "Hotel name contains invalid characters (letters, numbers, spaces, -, &, , only)"
    );

const description = z.string({
    required_error: "Description is required",
    invalid_type_error: "Description must be a string",
})
    .min(10, "Description must be at least 10 characters")
    .max(3000, "Description must be less than 3000 characters");

const address = z.string({
    required_error: "Address is required",
    invalid_type_error: "Address must be a string",
})
    .min(5, "Address must be at least 5 characters")
    .max(100, "Address must be less than 100 characters");

const state = z.string({
    required_error: "State is required",
    invalid_type_error: "State must be a string",
})
    .max(20, "State must be at most 20 characters")
    .regex(nameRegex, "State must contain only letters and spaces");

const city = z.string({
    required_error: "City is required",
    invalid_type_error: "City must be a string",
})
    .max(20, "City must be at most 20 characters")
    .regex(nameRegex, "City must contain only letters and spaces");

const time = z.string({
    required_error: "Time is required",
    invalid_type_error: "Time must be a string",
})
    .regex(timeRegex, "Invalid time format (HH:mm, 24-hour)");

const minGuestAge = z.number({
    required_error: "Minimum guest age is required",
    invalid_type_error: "Guest age must be a number",
})
    .min(18, "Guest age must be at least 18")
    .max(100, "Guest age seems invalid");

const booleanField = z.preprocess(
    (val) => val === "true" ? true : val === "false" ? false : val,
    z.boolean({ invalid_type_error: "Must be a boolean" })
);

const notes = z.string({
    required_error: "Special notes is required",
    invalid_type_error: "Special notes must be a string",
})
    .min(10, "Special notes must be at least 10 characters")
    .max(3000, "Special notes must be less than 3000 characters");


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

    amenities: z.preprocess(
        (val) => (typeof val === "string" ? JSON.parse(val) : val),
        z.array(z.string()).min(1, "At least one amenity is required")
    ),

    tags: z.preprocess(
        (val) => (typeof val === "string" ? JSON.parse(val) : val),
        z.array(z.string()).default([])
    ),

    geoLocation: z.preprocess(
        (val) => (typeof val === "string" ? JSON.parse(val) : val),
        z.tuple([
            z.number({ invalid_type_error: "Latitude must be a number" }),
            z.number({ invalid_type_error: "Longitude must be a number" }),
        ])
    ),

    rating: z
        .number({ invalid_type_error: "Rating must be a number" })
        .min(0, "Rating must be at least 0")
        .max(5, "Rating cannot exceed 5")
        .optional(),
}).strict();


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

        amenities: z
            .preprocess(
                (val) => (typeof val === "string" ? JSON.parse(val) : val),
                z.array(z.string()).min(1, "At least one amenity is required")
            )
            .optional(),

        tags: z
            .preprocess(
                (val) => (typeof val === "string" ? JSON.parse(val) : val),
                z.array(z.string())
            )
            .optional(),

        geoLocation: z
            .preprocess(
                (val) => (typeof val === "string" ? JSON.parse(val) : val),
                z.tuple([
                    z.number({ invalid_type_error: "Latitude must be a number" }),
                    z.number({ invalid_type_error: "Longitude must be a number" }),
                ])
            )
            .optional(),

        rating: z
            .preprocess(
                (val) => (val !== undefined ? Number(val) : undefined),
                z.number()
                    .min(0, "Rating must be at least 0")
                    .max(5, "Rating cannot exceed 5")
            )
            .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update",
    });
