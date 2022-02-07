import * as Joi from "joi";
import { MediaLink, mediaLinkSchema } from "./media-link";


export type ContentSectionTypes = 'header' | 'text-block' | 'text-image-right' | 'text-image-left' | 'image-row' | 'video-row-embed-only' | 'triple-image-col'
export const sectionTypesSchema = Joi.string().valid('header', 'text-block', 'text-image-right', 'text-image-left', 'image-row', 'video-row-embed-only', 'triple-image-col');


export interface TextProp {
    /**
     * For the editor.
     */
    markdown: string;
    /**
     * We store HTML so it's quick to render on page.
     */
    html: string;
}

export const contentTextSchema = Joi.object({
    markdown: Joi.string().allow(''),
    html: Joi.string().allow(''),
})

// Header
export interface ContentHeader {
    uid: string;
    text: TextProp;
}
export const contentHeaderSchema = Joi.object({
    uid: Joi.string().required(),
    text: contentTextSchema.required(),
})


// Text Block
export interface ContentTextBlock {
    uid: string;
    text: TextProp;
}
export const contentTextBlockSchema = Joi.object({
    uid: Joi.string().required(),
    text: contentTextSchema.required(),
})


// Text Image Right
export interface ContentTextImageRight {
    uid: string;
    text: TextProp;
    image: MediaLink;
}
export const contentTextImageRightSchema = Joi.object({
    uid: Joi.string().required(),
    text: contentTextSchema.required(),
    image: mediaLinkSchema.required()
})

// Text Image Left
export interface ContentTextImageLeft {
    uid: string;
    text: TextProp;
    image: MediaLink;
}
export const contentTextImageLeftSchema = Joi.object({
    uid: Joi.string().required(),
    text: contentTextSchema.required(),
    image: mediaLinkSchema.required()
})


// Image Row
export interface ContentImageRow {
    uid: string;
    image: MediaLink;
}
export const contentImageRowSchema = Joi.object({
    uid: Joi.string().required(),
    image: mediaLinkSchema.required()
})

// Triple Image col
export interface ContentTripleImageCol {
    uid: string;
    images: MediaLink[]
}
export const contentTripleImageColSchema = Joi.object({
    uid: Joi.string().required(),
    images: Joi.array().min(3).max(3).items(mediaLinkSchema).required(),
})

// Video Row Embed
export interface ContentVideoRowEmbed {
    uid: string;
    link?: string;
}
export const contentVideoRowEmbedSchema = Joi.object({
    uid: Joi.string().required(),
    link: Joi.string().uri().allow('').optional(),
})


export type ContentTypes = ContentHeader | ContentTextBlock | ContentTextImageRight | ContentTextImageLeft | ContentImageRow | ContentVideoRowEmbed | ContentTripleImageCol;

// The main holder for the content sections.
export default interface ContentSection<ContentTypes> {
    uid: string;
    type: ContentSectionTypes,
    content: ContentTypes,
}
export const contentSectionSchema = Joi.object({
    uid: Joi.string().required(),
    type: sectionTypesSchema,
    content: Joi.alternatives(
        contentHeaderSchema,
        contentTextBlockSchema,
        contentTextImageRightSchema,
        contentTextImageLeftSchema,
        contentImageRowSchema,
        contentVideoRowEmbedSchema,
        contentTripleImageColSchema
    ),
})
