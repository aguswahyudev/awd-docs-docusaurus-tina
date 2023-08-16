require("dotenv").config({ path: ".env.local" });

import React from "react";
import { defineConfig, TextField } from "tinacms";
import { ReferenceField } from "tinacms";
import { MDXTemplates } from "../src/theme/template";
import { titleFromSlug } from "../util";
import title from "title";

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.NEXT_PUBLIC_TINA_BRANCH ||
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";
const clientId = process.env.TINA_CLIENT_ID;
const token = process.env.TINA_AUTH_TOKEN;
const indexerToken = process.env.TINA_INDEXER_TOKEN;

const WarningIcon = (props) => {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      stroke-width="0"
      viewBox="0 0 24 24"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M11.001 10h2v5h-2zM11 16h2v2h-2z"></path>
      <path d="M13.768 4.2C13.42 3.545 12.742 3.138 12 3.138s-1.42.407-1.768 1.063L2.894 18.064a1.986 1.986 0 0 0 .054 1.968A1.984 1.984 0 0 0 4.661 21h14.678c.708 0 1.349-.362 1.714-.968a1.989 1.989 0 0 0 .054-1.968L13.768 4.2zM4.661 19 12 5.137 19.344 19H4.661z"></path>
    </svg>
  );
};

const RestartWarning = () => {
  return (
    <p className="rounded-lg border shadow px-4 py-2.5 bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 mb-4">
      <div className="flex items-center gap-2">
        <WarningIcon className={`w-6 h-auto flex-shrink-0 text-yellow-400`} />
        <div className={`flex-1 text-sm text-yellow-700 whitespace-normal	`}>
          To see settings changes reflected on your site, restart the Tina CLI
          after saving <em>(local development only)</em>.
        </div>
      </div>
    </p>
  );
};

const DocsCollection = {
  name: "doc",
  label: "Dokumentasi",
  path: "docs",
  format: "mdx",
  fields: [
    {
      type: "string",
      name: "title",
      label: "Judul",
      isTitle: true,
      required: true,
      ui: {
        // Is called on every form change and the result is put back into the value of the form (displayed to the user)
        format: (val) => (val ? val.toLowerCase() : ""),
      },
    },
    {
      type: "string",
      name: "description",
      label: "Deskripsi",
    },
    {
      label: "Tags",
      name: "tags",
      type: "string",
      list: true,
      ui: {
        component: "tags",
      },
    },
    {
      name: "last_update",
      label: "Terakhir diupdate",
      type: "object",
      fields: [
        {
          label: "Tanggal",
          name: "date",
          type: "datetime",
        },
      ],
    },
    {
      type: "rich-text",
      name: "body",
      label: "Isi",
      isBody: true,
      templates: [...MDXTemplates],
    },
  ],
};

const DocLinkTemplate = {
  name: "doc",
  label: "Doc Link",
  ui: {
    itemProps: (item) => {
      return {
        label: item?.label
          ? item?.label
          : item?.document
          ? titleFromSlug(item?.document)
          : item.name,
      };
    },
  },
  fields: [
    {
      label: "Judul Dokumen",
      name: "document",
      type: "reference",
      collections: ["doc"],
      isTitle: true,
      required: true,
    },
    {
      name: "label",
      label: "Label",
      description: "Secara default ini adalah judul dokumen",
      type: "string",
    },
  ],
};

const ExternalLinkTemplate = {
  name: "link",
  label: "Tautan Eksternal",
  ui: {
    itemProps: (item) => {
      return {
        label: item?.title ? item?.title : item.name,
      };
    },
  },
  fields: [
    {
      name: "title",
      label: "Label",
      type: "string",
      isTitle: true,
      required: true,
    },
    {
      name: "href",
      label: "URL",
      type: "string",
      required: true,
    },
  ],
};

const CategoryFields = [
  {
    name: "title",
    label: "Judul",
    type: "string",
    isTitle: true,
    required: true,
  },
  {
    name: "link",
    label: "Tautan",
    type: "string",
    options: [
      {
        label: "None",
        value: "none",
      },
      {
        label: "Dokumen",
        value: "doc",
      },
      {
        label: "Generated Index",
        value: "generated",
      },
    ],
  },
  {
    name: "docLink",
    label: "Dokumen",
    type: "reference",
    collections: ["doc"],
    ui: {
      component: (props) => {
        const link = React.useMemo(() => {
          let fieldName = props.field.name;
          fieldName =
            fieldName.substring(0, fieldName.lastIndexOf(".")) || fieldName;

          return fieldName
            .split(".")
            .reduce((o, i) => o[i], props.tinaForm.values).link;
        }, [props.tinaForm.values]);

        if (link !== "doc") {
          return null;
        }

        return ReferenceField(props);
      },
    },
  },
];

const ItemsField = {
  name: "items",
  label: "Item",
  type: "object",
  list: true,
};

const CategoryTemplateProps = {
  name: "category",
  label: "Kategori",
  ui: {
    itemProps: (item) => {
      return {
        label: item?.title ? item?.title : item.name,
      };
    },
    defaultItem: {
      link: "none",
    },
  },
};

const CategoryTemplate = {
  ...CategoryTemplateProps,
  fields: [
    ...CategoryFields,
    {
      ...ItemsField,
      templates: [
        {
          ...CategoryTemplateProps,
          fields: [
            ...CategoryFields,
            {
              ...ItemsField,
              templates: [
                {
                  ...CategoryTemplateProps,
                  fields: [
                    ...CategoryFields,
                    {
                      ...ItemsField,
                      templates: [DocLinkTemplate, ExternalLinkTemplate],
                    },
                  ],
                },
                DocLinkTemplate,
                ExternalLinkTemplate,
              ],
            },
          ],
        },
        DocLinkTemplate,
        ExternalLinkTemplate,
      ],
    },
  ],
};

const SidebarItemsField = {
  ...ItemsField,
  templates: [CategoryTemplate, DocLinkTemplate, ExternalLinkTemplate],
};

const SidebarCollection = {
  name: "sidebar",
  label: "Ubah Sidebar",
  path: "config/sidebar",
  format: "json",
  ui: {
    global: true,
    allowedActions: {
      create: false,
      delete: false,
    },
  },
  fields: [
    {
      type: "string",
      name: "_warning",
      ui: {
        component: () => {
          return <RestartWarning />;
        },
      },
    },
    {
      type: "string",
      label: "Label",
      name: "label",
      required: true,
      isTitle: true,
      ui: {
        component: "hidden",
      },
    },
    SidebarItemsField,
  ],
};

const NavbarItemFields = [
  {
    name: "label",
    label: "Label",
    type: "string",
    isTitle: true,
    required: true,
  },
  {
    name: "link",
    label: "Tautan",
    type: "string",
    options: [
      {
        label: "Tidak ada",
        value: "none",
      },
      {
        label: "Dokumen",
        value: "doc",
      },
      {
        label: "Halaman",
        value: "page",
      },
      {
        label: "Blog",
        value: "blog",
      },
      {
        label: "Ekternal",
        value: "external",
      },
    ],
  },
  {
    name: "docLink",
    label: "Dokumen",
    type: "reference",
    collections: ["doc"],
    ui: {
      component: (props) => {
        const link = React.useMemo(() => {
          let fieldName = props.field.name;
          fieldName =
            fieldName.substring(0, fieldName.lastIndexOf(".")) || fieldName;

          return fieldName
            .split(".")
            .reduce((o, i) => o[i], props.tinaForm.values).link;
        }, [props.tinaForm.values]);

        if (link !== "doc") {
          return null;
        }

        return ReferenceField(props);
      },
    },
  },
  {
    name: "externalLink",
    label: "URL",
    type: "string",
    ui: {
      component: (props) => {
        const link = React.useMemo(() => {
          let fieldName = props.field.name;
          fieldName =
            fieldName.substring(0, fieldName.lastIndexOf(".")) || fieldName;

          return fieldName
            .split(".")
            .reduce((o, i) => o[i], props.tinaForm.values).link;
        }, [props.tinaForm.values]);

        if (link !== "external") {
          return null;
        }

        return TextField(props);
      },
    },
  },
  {
    name: "position",
    label: "Posisi",
    type: "string",
    required: true,
    options: [
      {
        label: "Kiri",
        value: "left",
      },
      {
        label: "Kanan",
        value: "right",
      },
    ],
    ui: {
      component: "button-toggle",
    },
  },
];

const NavbarSubitemProps = {
  name: "items",
  label: "Items",
  type: "object",
  list: true,
  ui: {
    itemProps: (item) => ({
      label: item.label,
    }),
  },
};

const SettingsCollection = {
  label: "Pengaturan",
  name: "settings",
  path: "config/docusaurus",
  format: "json",
  ui: {
    global: true,
    allowedActions: {
      create: false,
      delete: false,
    },
  },
  fields: [
    {
      type: "string",
      name: "_warning",
      ui: {
        component: () => {
          return <RestartWarning />;
        },
      },
    },
    {
      type: "string",
      label: "Label",
      name: "label",
      required: true,
      isTitle: true,
      ui: {
        component: "hidden",
      },
    },
    {
      type: "object",
      label: "Logo",
      name: "logo",
      fields: [
        {
          type: "string",
          label: "Teks Alternatif",
          name: "alt",
        },
        {
          type: "image",
          label: "Sumber",
          name: "src",
        },
      ],
    },
    {
      type: "string",
      label: "Judul",
      name: "title",
      required: true,
    },
    {
      type: "string",
      label: "Slogan",
      name: "tagline",
    },
    {
      type: "string",
      label: "URL",
      name: "url",
      required: true,
    },
    {
      type: "object",
      label: "Navbar",
      name: "navbar",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item.label + " - " + title(item.position),
        }),
        defaultItem: {
          position: "left",
        },
      },
      fields: [
        ...NavbarItemFields,
        {
          ...NavbarSubitemProps,
          fields: [
            ...NavbarItemFields,
            {
              ...NavbarSubitemProps,
              fields: NavbarItemFields,
            },
          ],
        },
      ],
    },
    {
      type: "object",
      label: "Footer",
      name: "footer",
      fields: [
        {
          name: "style",
          label: "Style",
          type: "string",
          options: [
            {
              label: "Dark",
              value: "dark",
            },
            {
              label: "Light",
              value: "light",
            },
          ],
          ui: {
            component: "button-toggle",
          },
        },
        {
          type: "object",
          label: "Kategori",
          name: "links",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item.title,
            }),
          },
          fields: [
            {
              type: "string",
              label: "Judul",
              name: "title",
            },
            {
              type: "object",
              label: "Tautan",
              name: "items",
              list: true,
              templates: [
                {
                  name: "internal",
                  label: "Internal",
                  ui: {
                    itemProps: (item) => ({
                      label: item.label,
                    }),
                  },
                  fields: [
                    {
                      type: "string",
                      label: "Label",
                      name: "label",
                    },
                    {
                      type: "reference",
                      label: "Halaman",
                      name: "to",
                      collections: ["doc"],
                    },
                  ],
                },
                {
                  name: "external",
                  label: "Eksternal",
                  ui: {
                    itemProps: (item) => ({
                      label: item.label,
                    }),
                  },
                  fields: [
                    {
                      type: "string",
                      label: "Label",
                      name: "label",
                    },
                    {
                      type: "string",
                      label: "URL",
                      name: "href",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "string",
          label: "Copyright",
          name: "copyright",
        },
      ],
    },
  ],
};

export default defineConfig({
  branch,
  clientId, // Get this from tina.io
  token, // Get this from tina.io
  build: {
    outputFolder: "admin",
    publicFolder: "static",
  },
  media: {
    tina: {
      mediaRoot: "img",
      publicFolder: "static",
    },
  },
  schema: {
    collections: [DocsCollection, SidebarCollection, SettingsCollection],
  },
  search: {
    tina: {
      indexerToken,
      stopwordLanguages: ["eng"],
    },
    indexBatchSize: 100,
    maxSearchIndexFieldLength: 100,
  },
});
