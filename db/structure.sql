SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: jsonb_path_to_tsvector(jsonb, text[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.jsonb_path_to_tsvector(jsondata jsonb, path_elems text[], OUT tsv tsvector) RETURNS tsvector
    LANGUAGE plpgsql IMMUTABLE
    AS $$
        BEGIN
          SELECT INTO tsv
            COALESCE(
              public.tsvector_agg(to_tsvector(data #>> path_elems)),
              to_tsvector('')
            )
          FROM jsonb_array_elements(jsondata) AS data;
          RETURN;
        END;
        $$;


--
-- Name: tsvector_agg(tsvector); Type: AGGREGATE; Schema: public; Owner: -
--

CREATE AGGREGATE public.tsvector_agg(tsvector) (
    SFUNC = tsvector_concat,
    STYPE = tsvector
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: action_mailbox_inbound_emails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_mailbox_inbound_emails (
    id bigint NOT NULL,
    status integer DEFAULT 0 NOT NULL,
    message_id character varying NOT NULL,
    message_checksum character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: action_mailbox_inbound_emails_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.action_mailbox_inbound_emails_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: action_mailbox_inbound_emails_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.action_mailbox_inbound_emails_id_seq OWNED BY public.action_mailbox_inbound_emails.id;


--
-- Name: active_storage_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.active_storage_attachments (
    id bigint NOT NULL,
    name character varying NOT NULL,
    record_type character varying NOT NULL,
    record_id bigint NOT NULL,
    blob_id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: active_storage_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.active_storage_attachments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: active_storage_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.active_storage_attachments_id_seq OWNED BY public.active_storage_attachments.id;


--
-- Name: active_storage_blobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.active_storage_blobs (
    id bigint NOT NULL,
    key character varying NOT NULL,
    filename character varying NOT NULL,
    content_type character varying,
    metadata text,
    byte_size bigint NOT NULL,
    checksum character varying NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: active_storage_blobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.active_storage_blobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: active_storage_blobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.active_storage_blobs_id_seq OWNED BY public.active_storage_blobs.id;


--
-- Name: ahoy_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ahoy_events (
    id integer NOT NULL,
    visit_id integer,
    user_id integer,
    name character varying,
    properties jsonb,
    "time" timestamp without time zone
);


--
-- Name: ahoy_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ahoy_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ahoy_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ahoy_events_id_seq OWNED BY public.ahoy_events.id;


--
-- Name: announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcements (
    id bigint NOT NULL,
    content text,
    url character varying,
    visible_logged_out boolean,
    deactivated_at timestamp without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.announcements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;


--
-- Name: answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.answers (
    id integer NOT NULL,
    question_id integer,
    quiz_id integer,
    reader_id integer,
    content character varying,
    correct boolean,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    case_completion numeric,
    submission_id bigint
);


--
-- Name: answers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.answers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.answers_id_seq OWNED BY public.answers.id;


--
-- Name: ar_internal_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ar_internal_metadata (
    key character varying NOT NULL,
    value character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: authentication_strategies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.authentication_strategies (
    id integer NOT NULL,
    provider character varying,
    uid character varying,
    reader_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: authentication_strategies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.authentication_strategies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: authentication_strategies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.authentication_strategies_id_seq OWNED BY public.authentication_strategies.id;


--
-- Name: cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cards (
    id integer NOT NULL,
    "position" integer,
    page_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    solid boolean DEFAULT true,
    element_type character varying,
    element_id integer,
    case_id integer,
    raw_content jsonb DEFAULT '""'::jsonb
);


--
-- Name: cards_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cards_id_seq OWNED BY public.cards.id;


--
-- Name: case_archives; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.case_archives (
    id bigint NOT NULL,
    case_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: case_archives_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.case_archives_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: case_archives_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.case_archives_id_seq OWNED BY public.case_archives.id;


--
-- Name: case_elements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.case_elements (
    id integer NOT NULL,
    case_id integer,
    element_type character varying,
    element_id integer,
    "position" integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: case_elements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.case_elements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: case_elements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.case_elements_id_seq OWNED BY public.case_elements.id;


--
-- Name: case_library_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.case_library_requests (
    id bigint NOT NULL,
    case_id bigint,
    library_id bigint,
    requester_id bigint,
    status character varying DEFAULT 'pending'::character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: case_library_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.case_library_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: case_library_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.case_library_requests_id_seq OWNED BY public.case_library_requests.id;


--
-- Name: cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cases (
    id integer NOT NULL,
    slug text NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    photo_credit text,
    commentable boolean,
    published_at timestamp without time zone,
    featured_at timestamp without time zone,
    latitude double precision,
    longitude double precision,
    zoom double precision,
    library_id bigint,
    locale text NOT NULL,
    translation_base_id bigint,
    acknowledgements text DEFAULT ''::text,
    audience text DEFAULT ''::text,
    authors jsonb DEFAULT '""'::jsonb,
    classroom_timeline text DEFAULT ''::text,
    dek text DEFAULT ''::text,
    kicker text DEFAULT ''::text,
    learning_objectives jsonb DEFAULT '""'::jsonb,
    summary text DEFAULT ''::text,
    title text DEFAULT ''::text,
    translators jsonb DEFAULT '""'::jsonb,
    license character varying DEFAULT 'cc_by_nc'::character varying NOT NULL
);


--
-- Name: cases_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cases_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cases_id_seq OWNED BY public.cases.id;


--
-- Name: comment_threads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comment_threads (
    id integer NOT NULL,
    case_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    original_highlight_text character varying,
    locale character varying,
    card_id integer,
    reader_id integer,
    forum_id integer,
    comments_count integer,
    key character varying
);


--
-- Name: comment_threads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.comment_threads_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comment_threads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.comment_threads_id_seq OWNED BY public.comment_threads.id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    reader_id integer,
    comment_thread_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    "position" integer,
    content jsonb DEFAULT '""'::jsonb
);


--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: communities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.communities (
    id integer NOT NULL,
    name jsonb,
    group_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    description jsonb DEFAULT '""'::jsonb,
    universal boolean DEFAULT false
);


--
-- Name: communities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.communities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: communities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.communities_id_seq OWNED BY public.communities.id;


--
-- Name: deployments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deployments (
    id integer NOT NULL,
    case_id integer,
    group_id integer,
    quiz_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    answers_needed integer DEFAULT 1,
    key character varying
);


--
-- Name: deployments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.deployments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: deployments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.deployments_id_seq OWNED BY public.deployments.id;


--
-- Name: edgenotes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.edgenotes (
    id integer NOT NULL,
    format character varying,
    thumbnail_url character varying,
    case_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    slug text NOT NULL,
    card_id integer,
    style integer DEFAULT 0,
    alt_text character varying,
    layout integer DEFAULT 0,
    attribution text DEFAULT ''::text,
    audio_url text DEFAULT ''::text,
    call_to_action text DEFAULT ''::text,
    caption text DEFAULT ''::text,
    content text DEFAULT ''::text,
    embed_code text DEFAULT ''::text,
    image_url text DEFAULT ''::text,
    instructions text DEFAULT ''::text,
    pdf_url text DEFAULT ''::text,
    photo_credit text DEFAULT ''::text,
    pull_quote text DEFAULT ''::text,
    website_url text DEFAULT ''::text,
    icon_slug text
);


--
-- Name: edgenotes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.edgenotes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: edgenotes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.edgenotes_id_seq OWNED BY public.edgenotes.id;


--
-- Name: editorships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.editorships (
    id bigint NOT NULL,
    case_id bigint,
    editor_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: editorships_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.editorships_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: editorships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.editorships_id_seq OWNED BY public.editorships.id;


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.enrollments (
    id integer NOT NULL,
    reader_id integer,
    case_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    status integer DEFAULT 0,
    active_group_id integer
);


--
-- Name: enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.enrollments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.enrollments_id_seq OWNED BY public.enrollments.id;


--
-- Name: forums; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.forums (
    id integer NOT NULL,
    case_id integer,
    community_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: forums_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.forums_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: forums_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.forums_id_seq OWNED BY public.forums.id;


--
-- Name: friendly_id_slugs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.friendly_id_slugs (
    id bigint NOT NULL,
    slug character varying NOT NULL,
    sluggable_id integer NOT NULL,
    sluggable_type character varying(50),
    scope character varying,
    created_at timestamp without time zone
);


--
-- Name: friendly_id_slugs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.friendly_id_slugs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: friendly_id_slugs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.friendly_id_slugs_id_seq OWNED BY public.friendly_id_slugs.id;


--
-- Name: group_memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_memberships (
    id integer NOT NULL,
    reader_id integer,
    group_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    status integer DEFAULT 0 NOT NULL
);


--
-- Name: group_memberships_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.group_memberships_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: group_memberships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.group_memberships_id_seq OWNED BY public.group_memberships.id;


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups (
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    context_id character varying,
    name jsonb DEFAULT '""'::jsonb
);


--
-- Name: groups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.groups_id_seq OWNED BY public.groups.id;


--
-- Name: invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invitations (
    id integer NOT NULL,
    reader_id integer,
    community_id integer,
    inviter_id integer,
    accepted_at timestamp without time zone,
    rescinded_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: invitations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.invitations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: invitations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.invitations_id_seq OWNED BY public.invitations.id;


--
-- Name: libraries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.libraries (
    id bigint NOT NULL,
    slug character varying,
    logo_url character varying,
    background_color character varying,
    foreground_color character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    description jsonb,
    url jsonb,
    name jsonb,
    cases_count integer DEFAULT 0,
    visible_in_catalog_at timestamp without time zone
);


--
-- Name: libraries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.libraries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: libraries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.libraries_id_seq OWNED BY public.libraries.id;


--
-- Name: link_expansion_visibilities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.link_expansion_visibilities (
    id bigint NOT NULL,
    no_description boolean DEFAULT false,
    no_embed boolean DEFAULT false,
    no_image boolean DEFAULT false,
    edgenote_id bigint
);


--
-- Name: link_expansion_visibilities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.link_expansion_visibilities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: link_expansion_visibilities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.link_expansion_visibilities_id_seq OWNED BY public.link_expansion_visibilities.id;


--
-- Name: locks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.locks (
    id bigint NOT NULL,
    lockable_type character varying,
    lockable_id bigint,
    reader_id bigint,
    case_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: locks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.locks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: locks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.locks_id_seq OWNED BY public.locks.id;


--
-- Name: managerships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.managerships (
    id bigint NOT NULL,
    library_id bigint,
    manager_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: managerships_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.managerships_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: managerships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.managerships_id_seq OWNED BY public.managerships.id;


--
-- Name: pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages (
    id integer NOT NULL,
    "position" integer,
    case_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    title text DEFAULT ''::text,
    icon_slug text
);


--
-- Name: pages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pages_id_seq OWNED BY public.pages.id;


--
-- Name: podcasts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.podcasts (
    id integer NOT NULL,
    case_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    "position" integer,
    artwork_url character varying,
    photo_credit text,
    audio_url text DEFAULT ''::text,
    credits text DEFAULT ''::text,
    title text DEFAULT ''::text
);


--
-- Name: podcasts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.podcasts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: podcasts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.podcasts_id_seq OWNED BY public.podcasts.id;


--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.questions (
    id integer NOT NULL,
    quiz_id integer,
    correct_answer text,
    options character varying[] DEFAULT '{}'::character varying[],
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    content jsonb DEFAULT '""'::jsonb
);


--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.questions_id_seq OWNED BY public.questions.id;


--
-- Name: quizzes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quizzes (
    id integer NOT NULL,
    case_id integer,
    template_id integer,
    customized boolean,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    author_id integer,
    lti_uid character varying,
    title character varying DEFAULT ''::character varying
);


--
-- Name: quizzes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.quizzes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quizzes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.quizzes_id_seq OWNED BY public.quizzes.id;


--
-- Name: readers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.readers (
    id integer NOT NULL,
    name text,
    image_url text,
    email character varying DEFAULT ''::character varying NOT NULL,
    encrypted_password character varying DEFAULT ''::character varying,
    reset_password_token character varying,
    reset_password_sent_at timestamp without time zone,
    remember_created_at timestamp without time zone,
    sign_in_count integer DEFAULT 0 NOT NULL,
    current_sign_in_at timestamp without time zone,
    last_sign_in_at timestamp without time zone,
    current_sign_in_ip inet,
    last_sign_in_ip inet,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    initials text,
    locale text,
    confirmation_token character varying,
    confirmed_at timestamp without time zone,
    confirmation_sent_at timestamp without time zone,
    unconfirmed_email character varying,
    created_password boolean DEFAULT true,
    send_reply_notifications boolean DEFAULT true,
    active_community_id integer,
    persona character varying,
    seen_announcements_created_before timestamp without time zone,
    terms_of_service integer DEFAULT 0
);


--
-- Name: readers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.readers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: readers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.readers_id_seq OWNED BY public.readers.id;


--
-- Name: readers_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.readers_roles (
    reader_id integer,
    role_id integer
);


--
-- Name: reading_list_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reading_list_items (
    id bigint NOT NULL,
    notes text DEFAULT ''::text NOT NULL,
    "position" integer NOT NULL,
    case_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    reading_list_id bigint
);


--
-- Name: reading_list_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reading_list_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reading_list_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reading_list_items_id_seq OWNED BY public.reading_list_items.id;


--
-- Name: reading_list_saves; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reading_list_saves (
    id bigint NOT NULL,
    reader_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    reading_list_id bigint
);


--
-- Name: reading_list_saves_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reading_list_saves_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reading_list_saves_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reading_list_saves_id_seq OWNED BY public.reading_list_saves.id;


--
-- Name: reading_lists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reading_lists (
    uuid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    title character varying DEFAULT ''::character varying NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    reader_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL
);


--
-- Name: reading_lists_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reading_lists_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reading_lists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reading_lists_id_seq OWNED BY public.reading_lists.id;


--
-- Name: reply_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reply_notifications (
    id integer NOT NULL,
    reader_id integer,
    notifier_id integer,
    comment_id integer,
    comment_thread_id integer,
    case_id integer,
    page_id integer,
    card_id integer
);


--
-- Name: reply_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reply_notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reply_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reply_notifications_id_seq OWNED BY public.reply_notifications.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying,
    resource_type character varying,
    resource_id integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: spotlight_acknowledgements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.spotlight_acknowledgements (
    id bigint NOT NULL,
    reader_id bigint,
    spotlight_key character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: spotlight_acknowledgements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.spotlight_acknowledgements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: spotlight_acknowledgements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.spotlight_acknowledgements_id_seq OWNED BY public.spotlight_acknowledgements.id;


--
-- Name: submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.submissions (
    id bigint NOT NULL,
    quiz_id bigint,
    reader_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.submissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.submissions_id_seq OWNED BY public.submissions.id;


--
-- Name: taggings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.taggings (
    id bigint NOT NULL,
    case_id bigint,
    tag_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: taggings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.taggings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: taggings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.taggings_id_seq OWNED BY public.taggings.id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tags (
    id bigint NOT NULL,
    category boolean DEFAULT false NOT NULL,
    name character varying NOT NULL,
    display_name jsonb,
    taggings_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: visits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.visits (
    id integer NOT NULL,
    visit_token character varying,
    visitor_token character varying,
    ip character varying,
    user_agent text,
    referrer text,
    landing_page text,
    user_id integer,
    referring_domain character varying,
    search_keyword character varying,
    browser character varying,
    os character varying,
    device_type character varying,
    screen_height integer,
    screen_width integer,
    country character varying,
    region character varying,
    city character varying,
    postal_code character varying,
    latitude numeric,
    longitude numeric,
    utm_source character varying,
    utm_medium character varying,
    utm_term character varying,
    utm_content character varying,
    utm_campaign character varying,
    started_at timestamp without time zone
);


--
-- Name: visits_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.visits_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: visits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.visits_id_seq OWNED BY public.visits.id;


--
-- Name: wikidata_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wikidata_links (
    id bigint NOT NULL,
    object_type character varying NOT NULL,
    object_id bigint NOT NULL,
    case_id bigint NOT NULL,
    schema character varying NOT NULL,
    qid character varying NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: wikidata_links_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.wikidata_links_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: wikidata_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.wikidata_links_id_seq OWNED BY public.wikidata_links.id;


--
-- Name: action_mailbox_inbound_emails id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_mailbox_inbound_emails ALTER COLUMN id SET DEFAULT nextval('public.action_mailbox_inbound_emails_id_seq'::regclass);


--
-- Name: active_storage_attachments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_attachments ALTER COLUMN id SET DEFAULT nextval('public.active_storage_attachments_id_seq'::regclass);


--
-- Name: active_storage_blobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_blobs ALTER COLUMN id SET DEFAULT nextval('public.active_storage_blobs_id_seq'::regclass);


--
-- Name: ahoy_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ahoy_events ALTER COLUMN id SET DEFAULT nextval('public.ahoy_events_id_seq'::regclass);


--
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);


--
-- Name: answers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers ALTER COLUMN id SET DEFAULT nextval('public.answers_id_seq'::regclass);


--
-- Name: authentication_strategies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authentication_strategies ALTER COLUMN id SET DEFAULT nextval('public.authentication_strategies_id_seq'::regclass);


--
-- Name: cards id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards ALTER COLUMN id SET DEFAULT nextval('public.cards_id_seq'::regclass);


--
-- Name: case_archives id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_archives ALTER COLUMN id SET DEFAULT nextval('public.case_archives_id_seq'::regclass);


--
-- Name: case_elements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_elements ALTER COLUMN id SET DEFAULT nextval('public.case_elements_id_seq'::regclass);


--
-- Name: case_library_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_library_requests ALTER COLUMN id SET DEFAULT nextval('public.case_library_requests_id_seq'::regclass);


--
-- Name: cases id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases ALTER COLUMN id SET DEFAULT nextval('public.cases_id_seq'::regclass);


--
-- Name: comment_threads id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_threads ALTER COLUMN id SET DEFAULT nextval('public.comment_threads_id_seq'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: communities id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communities ALTER COLUMN id SET DEFAULT nextval('public.communities_id_seq'::regclass);


--
-- Name: deployments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deployments ALTER COLUMN id SET DEFAULT nextval('public.deployments_id_seq'::regclass);


--
-- Name: edgenotes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edgenotes ALTER COLUMN id SET DEFAULT nextval('public.edgenotes_id_seq'::regclass);


--
-- Name: editorships id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.editorships ALTER COLUMN id SET DEFAULT nextval('public.editorships_id_seq'::regclass);


--
-- Name: enrollments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments ALTER COLUMN id SET DEFAULT nextval('public.enrollments_id_seq'::regclass);


--
-- Name: forums id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forums ALTER COLUMN id SET DEFAULT nextval('public.forums_id_seq'::regclass);


--
-- Name: friendly_id_slugs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friendly_id_slugs ALTER COLUMN id SET DEFAULT nextval('public.friendly_id_slugs_id_seq'::regclass);


--
-- Name: group_memberships id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_memberships ALTER COLUMN id SET DEFAULT nextval('public.group_memberships_id_seq'::regclass);


--
-- Name: groups id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups ALTER COLUMN id SET DEFAULT nextval('public.groups_id_seq'::regclass);


--
-- Name: invitations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invitations ALTER COLUMN id SET DEFAULT nextval('public.invitations_id_seq'::regclass);


--
-- Name: libraries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libraries ALTER COLUMN id SET DEFAULT nextval('public.libraries_id_seq'::regclass);


--
-- Name: link_expansion_visibilities id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.link_expansion_visibilities ALTER COLUMN id SET DEFAULT nextval('public.link_expansion_visibilities_id_seq'::regclass);


--
-- Name: locks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locks ALTER COLUMN id SET DEFAULT nextval('public.locks_id_seq'::regclass);


--
-- Name: managerships id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.managerships ALTER COLUMN id SET DEFAULT nextval('public.managerships_id_seq'::regclass);


--
-- Name: pages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages ALTER COLUMN id SET DEFAULT nextval('public.pages_id_seq'::regclass);


--
-- Name: podcasts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcasts ALTER COLUMN id SET DEFAULT nextval('public.podcasts_id_seq'::regclass);


--
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions ALTER COLUMN id SET DEFAULT nextval('public.questions_id_seq'::regclass);


--
-- Name: quizzes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quizzes ALTER COLUMN id SET DEFAULT nextval('public.quizzes_id_seq'::regclass);


--
-- Name: readers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.readers ALTER COLUMN id SET DEFAULT nextval('public.readers_id_seq'::regclass);


--
-- Name: reading_list_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_list_items ALTER COLUMN id SET DEFAULT nextval('public.reading_list_items_id_seq'::regclass);


--
-- Name: reading_list_saves id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_list_saves ALTER COLUMN id SET DEFAULT nextval('public.reading_list_saves_id_seq'::regclass);


--
-- Name: reading_lists id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_lists ALTER COLUMN id SET DEFAULT nextval('public.reading_lists_id_seq'::regclass);


--
-- Name: reply_notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reply_notifications ALTER COLUMN id SET DEFAULT nextval('public.reply_notifications_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: spotlight_acknowledgements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spotlight_acknowledgements ALTER COLUMN id SET DEFAULT nextval('public.spotlight_acknowledgements_id_seq'::regclass);


--
-- Name: submissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions ALTER COLUMN id SET DEFAULT nextval('public.submissions_id_seq'::regclass);


--
-- Name: taggings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taggings ALTER COLUMN id SET DEFAULT nextval('public.taggings_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Name: visits id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits ALTER COLUMN id SET DEFAULT nextval('public.visits_id_seq'::regclass);


--
-- Name: wikidata_links id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wikidata_links ALTER COLUMN id SET DEFAULT nextval('public.wikidata_links_id_seq'::regclass);


--
-- Name: cases cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_pkey PRIMARY KEY (id);


--
-- Name: cases_search_index; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.cases_search_index AS
 SELECT cases.id,
    (((((((((setweight(to_tsvector(COALESCE(cases.kicker, ''::text)), 'A'::"char") || setweight(to_tsvector(COALESCE(cases.title, ''::text)), 'A'::"char")) || setweight(to_tsvector(COALESCE(cases.dek, ''::text)), 'A'::"char")) || setweight(to_tsvector(COALESCE(cases.summary, ''::text)), 'A'::"char")) || setweight(public.jsonb_path_to_tsvector(
        CASE
            WHEN (jsonb_typeof(cases.learning_objectives) <> 'array'::text) THEN '[]'::jsonb
            ELSE cases.learning_objectives
        END, '{}'::text[]), 'B'::"char")) || public.jsonb_path_to_tsvector(cases.authors, '{name}'::text[])) || setweight(to_tsvector(COALESCE(string_agg(pages.title, ' '::text), ''::text)), 'B'::"char")) || setweight(to_tsvector(COALESCE(string_agg(podcasts.title, ' '::text), ''::text)), 'B'::"char")) || to_tsvector(COALESCE(string_agg(podcasts.credits, ' '::text), ''::text))) || COALESCE(public.tsvector_agg(public.jsonb_path_to_tsvector((cards.raw_content -> 'blocks'::text), '{text}'::text[])), to_tsvector(''::text))) AS document
   FROM (((public.cases
     LEFT JOIN public.pages ON ((pages.case_id = cases.id)))
     LEFT JOIN public.podcasts ON ((podcasts.case_id = cases.id)))
     LEFT JOIN public.cards ON ((cards.case_id = cases.id)))
  GROUP BY cases.id
  WITH NO DATA;


--
-- Name: action_mailbox_inbound_emails action_mailbox_inbound_emails_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_mailbox_inbound_emails
    ADD CONSTRAINT action_mailbox_inbound_emails_pkey PRIMARY KEY (id);


--
-- Name: active_storage_attachments active_storage_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_attachments
    ADD CONSTRAINT active_storage_attachments_pkey PRIMARY KEY (id);


--
-- Name: active_storage_blobs active_storage_blobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_blobs
    ADD CONSTRAINT active_storage_blobs_pkey PRIMARY KEY (id);


--
-- Name: ahoy_events ahoy_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ahoy_events
    ADD CONSTRAINT ahoy_events_pkey PRIMARY KEY (id);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: answers answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_pkey PRIMARY KEY (id);


--
-- Name: ar_internal_metadata ar_internal_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ar_internal_metadata
    ADD CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key);


--
-- Name: authentication_strategies authentication_strategies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authentication_strategies
    ADD CONSTRAINT authentication_strategies_pkey PRIMARY KEY (id);


--
-- Name: cards cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_pkey PRIMARY KEY (id);


--
-- Name: case_archives case_archives_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_archives
    ADD CONSTRAINT case_archives_pkey PRIMARY KEY (id);


--
-- Name: case_elements case_elements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_elements
    ADD CONSTRAINT case_elements_pkey PRIMARY KEY (id);


--
-- Name: case_library_requests case_library_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_library_requests
    ADD CONSTRAINT case_library_requests_pkey PRIMARY KEY (id);


--
-- Name: comment_threads comment_threads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_threads
    ADD CONSTRAINT comment_threads_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: communities communities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_pkey PRIMARY KEY (id);


--
-- Name: deployments deployments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deployments
    ADD CONSTRAINT deployments_pkey PRIMARY KEY (id);


--
-- Name: edgenotes edgenotes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edgenotes
    ADD CONSTRAINT edgenotes_pkey PRIMARY KEY (id);


--
-- Name: editorships editorships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.editorships
    ADD CONSTRAINT editorships_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: forums forums_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forums
    ADD CONSTRAINT forums_pkey PRIMARY KEY (id);


--
-- Name: friendly_id_slugs friendly_id_slugs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friendly_id_slugs
    ADD CONSTRAINT friendly_id_slugs_pkey PRIMARY KEY (id);


--
-- Name: group_memberships group_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_memberships
    ADD CONSTRAINT group_memberships_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: invitations invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_pkey PRIMARY KEY (id);


--
-- Name: libraries libraries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libraries
    ADD CONSTRAINT libraries_pkey PRIMARY KEY (id);


--
-- Name: link_expansion_visibilities link_expansion_visibilities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.link_expansion_visibilities
    ADD CONSTRAINT link_expansion_visibilities_pkey PRIMARY KEY (id);


--
-- Name: locks locks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locks
    ADD CONSTRAINT locks_pkey PRIMARY KEY (id);


--
-- Name: managerships managerships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.managerships
    ADD CONSTRAINT managerships_pkey PRIMARY KEY (id);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: podcasts podcasts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcasts
    ADD CONSTRAINT podcasts_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (id);


--
-- Name: readers readers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.readers
    ADD CONSTRAINT readers_pkey PRIMARY KEY (id);


--
-- Name: reading_list_items reading_list_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_list_items
    ADD CONSTRAINT reading_list_items_pkey PRIMARY KEY (id);


--
-- Name: reading_list_saves reading_list_saves_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_list_saves
    ADD CONSTRAINT reading_list_saves_pkey PRIMARY KEY (id);


--
-- Name: reading_lists reading_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_lists
    ADD CONSTRAINT reading_lists_pkey PRIMARY KEY (id);


--
-- Name: reply_notifications reply_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reply_notifications
    ADD CONSTRAINT reply_notifications_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: spotlight_acknowledgements spotlight_acknowledgements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spotlight_acknowledgements
    ADD CONSTRAINT spotlight_acknowledgements_pkey PRIMARY KEY (id);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: taggings taggings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taggings
    ADD CONSTRAINT taggings_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: visits visits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_pkey PRIMARY KEY (id);


--
-- Name: wikidata_links wikidata_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wikidata_links
    ADD CONSTRAINT wikidata_links_pkey PRIMARY KEY (id);


--
-- Name: index_action_mailbox_inbound_emails_uniqueness; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_action_mailbox_inbound_emails_uniqueness ON public.action_mailbox_inbound_emails USING btree (message_id, message_checksum);


--
-- Name: index_active_storage_attachments_on_blob_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_active_storage_attachments_on_blob_id ON public.active_storage_attachments USING btree (blob_id);


--
-- Name: index_active_storage_attachments_uniqueness; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_active_storage_attachments_uniqueness ON public.active_storage_attachments USING btree (record_type, record_id, name, blob_id);


--
-- Name: index_active_storage_blobs_on_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_active_storage_blobs_on_key ON public.active_storage_blobs USING btree (key);


--
-- Name: index_ahoy_events_on_name_and_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ahoy_events_on_name_and_time ON public.ahoy_events USING btree (name, "time");


--
-- Name: index_ahoy_events_on_properties_jsonb_path_ops; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ahoy_events_on_properties_jsonb_path_ops ON public.ahoy_events USING gin (properties jsonb_path_ops);


--
-- Name: index_ahoy_events_on_user_id_and_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ahoy_events_on_user_id_and_name ON public.ahoy_events USING btree (user_id, name);


--
-- Name: index_ahoy_events_on_visit_id_and_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ahoy_events_on_visit_id_and_name ON public.ahoy_events USING btree (visit_id, name);


--
-- Name: index_announcements_on_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_announcements_on_created_at ON public.announcements USING btree (created_at);


--
-- Name: index_announcements_on_deactivated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_announcements_on_deactivated_at ON public.announcements USING btree (deactivated_at);


--
-- Name: index_answers_on_question_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_answers_on_question_id ON public.answers USING btree (question_id);


--
-- Name: index_answers_on_quiz_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_answers_on_quiz_id ON public.answers USING btree (quiz_id);


--
-- Name: index_answers_on_reader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_answers_on_reader_id ON public.answers USING btree (reader_id);


--
-- Name: index_answers_on_submission_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_answers_on_submission_id ON public.answers USING btree (submission_id);


--
-- Name: index_authentication_strategies_on_reader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_authentication_strategies_on_reader_id ON public.authentication_strategies USING btree (reader_id);


--
-- Name: index_authentication_strategies_on_uid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_authentication_strategies_on_uid ON public.authentication_strategies USING btree (uid) WHERE ((provider)::text = 'lti'::text);


--
-- Name: index_cards_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_cards_on_case_id ON public.cards USING btree (case_id);


--
-- Name: index_cards_on_element_type_and_element_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_cards_on_element_type_and_element_id ON public.cards USING btree (element_type, element_id);


--
-- Name: index_cards_on_page_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_cards_on_page_id ON public.cards USING btree (page_id);


--
-- Name: index_case_archives_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_case_archives_on_case_id ON public.case_archives USING btree (case_id);


--
-- Name: index_case_elements_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_case_elements_on_case_id ON public.case_elements USING btree (case_id);


--
-- Name: index_case_elements_on_element_id_and_element_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_case_elements_on_element_id_and_element_type ON public.case_elements USING btree (element_id, element_type);


--
-- Name: index_case_elements_on_element_type_and_element_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_case_elements_on_element_type_and_element_id ON public.case_elements USING btree (element_type, element_id);


--
-- Name: index_case_library_requests_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_case_library_requests_on_case_id ON public.case_library_requests USING btree (case_id);


--
-- Name: index_case_library_requests_on_library_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_case_library_requests_on_library_id ON public.case_library_requests USING btree (library_id);


--
-- Name: index_case_library_requests_on_requester_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_case_library_requests_on_requester_id ON public.case_library_requests USING btree (requester_id);


--
-- Name: index_cases_on_full_text; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_cases_on_full_text ON public.cases_search_index USING gin (document);


--
-- Name: index_cases_on_library_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_cases_on_library_id ON public.cases USING btree (library_id);


--
-- Name: index_cases_on_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_cases_on_slug ON public.cases USING btree (slug);


--
-- Name: index_cases_on_translation_base_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_cases_on_translation_base_id ON public.cases USING btree (translation_base_id);


--
-- Name: index_cases_search_index; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_cases_search_index ON public.cases_search_index USING btree (id);


--
-- Name: index_comment_threads_on_card_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comment_threads_on_card_id ON public.comment_threads USING btree (card_id);


--
-- Name: index_comment_threads_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comment_threads_on_case_id ON public.comment_threads USING btree (case_id);


--
-- Name: index_comment_threads_on_forum_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comment_threads_on_forum_id ON public.comment_threads USING btree (forum_id);


--
-- Name: index_comment_threads_on_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_comment_threads_on_key ON public.comment_threads USING btree (key);


--
-- Name: index_comment_threads_on_reader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comment_threads_on_reader_id ON public.comment_threads USING btree (reader_id);


--
-- Name: index_comments_on_comment_thread_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comments_on_comment_thread_id ON public.comments USING btree (comment_thread_id);


--
-- Name: index_comments_on_reader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comments_on_reader_id ON public.comments USING btree (reader_id);


--
-- Name: index_communities_on_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communities_on_group_id ON public.communities USING btree (group_id);


--
-- Name: index_communities_on_universal; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communities_on_universal ON public.communities USING btree (universal);


--
-- Name: index_deployments_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_deployments_on_case_id ON public.deployments USING btree (case_id);


--
-- Name: index_deployments_on_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_deployments_on_group_id ON public.deployments USING btree (group_id);


--
-- Name: index_deployments_on_group_id_and_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_deployments_on_group_id_and_case_id ON public.deployments USING btree (group_id, case_id);


--
-- Name: index_deployments_on_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_deployments_on_key ON public.deployments USING btree (key);


--
-- Name: index_deployments_on_quiz_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_deployments_on_quiz_id ON public.deployments USING btree (quiz_id);


--
-- Name: index_edgenotes_on_card_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_edgenotes_on_card_id ON public.edgenotes USING btree (card_id);


--
-- Name: index_edgenotes_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_edgenotes_on_case_id ON public.edgenotes USING btree (case_id);


--
-- Name: index_edgenotes_on_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_edgenotes_on_slug ON public.edgenotes USING btree (slug);


--
-- Name: index_editorships_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_editorships_on_case_id ON public.editorships USING btree (case_id);


--
-- Name: index_editorships_on_case_id_and_editor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_editorships_on_case_id_and_editor_id ON public.editorships USING btree (case_id, editor_id);


--
-- Name: index_editorships_on_editor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_editorships_on_editor_id ON public.editorships USING btree (editor_id);


--
-- Name: index_enrollments_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_enrollments_on_case_id ON public.enrollments USING btree (case_id);


--
-- Name: index_enrollments_on_case_id_and_reader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_enrollments_on_case_id_and_reader_id ON public.enrollments USING btree (case_id, reader_id);


--
-- Name: index_enrollments_on_reader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_enrollments_on_reader_id ON public.enrollments USING btree (reader_id);


--
-- Name: index_forums_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_forums_on_case_id ON public.forums USING btree (case_id);


--
-- Name: index_forums_on_community_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_forums_on_community_id ON public.forums USING btree (community_id);


--
-- Name: index_friendly_id_slugs_on_slug_and_sluggable_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_friendly_id_slugs_on_slug_and_sluggable_type ON public.friendly_id_slugs USING btree (slug, sluggable_type);


--
-- Name: index_friendly_id_slugs_on_slug_and_sluggable_type_and_scope; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_friendly_id_slugs_on_slug_and_sluggable_type_and_scope ON public.friendly_id_slugs USING btree (slug, sluggable_type, scope);


--
-- Name: index_friendly_id_slugs_on_sluggable_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_friendly_id_slugs_on_sluggable_id ON public.friendly_id_slugs USING btree (sluggable_id);


--
-- Name: index_friendly_id_slugs_on_sluggable_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_friendly_id_slugs_on_sluggable_type ON public.friendly_id_slugs USING btree (sluggable_type);


--
-- Name: index_group_memberships_on_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_group_memberships_on_group_id ON public.group_memberships USING btree (group_id);


--
-- Name: index_group_memberships_on_reader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_group_memberships_on_reader_id ON public.group_memberships USING btree (reader_id);


--
-- Name: index_groups_on_context_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_groups_on_context_id ON public.groups USING btree (context_id);


--
-- Name: index_invitations_on_community_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_invitations_on_community_id ON public.invitations USING btree (community_id);


--
-- Name: index_invitations_on_community_id_and_reader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_invitations_on_community_id_and_reader_id ON public.invitations USING btree (community_id, reader_id);


--
-- Name: index_invitations_on_reader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_invitations_on_reader_id ON public.invitations USING btree (reader_id);


--
-- Name: index_libraries_on_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_libraries_on_slug ON public.libraries USING btree (slug);


--
-- Name: index_libraries_on_visible_in_catalog_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_libraries_on_visible_in_catalog_at ON public.libraries USING btree (visible_in_catalog_at);


--
-- Name: index_link_expansion_visibilities_on_edgenote_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_link_expansion_visibilities_on_edgenote_id ON public.link_expansion_visibilities USING btree (edgenote_id);


--
-- Name: index_locks_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_locks_on_case_id ON public.locks USING btree (case_id);


--
-- Name: index_locks_on_lockable_type_and_lockable_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_locks_on_lockable_type_and_lockable_id ON public.locks USING btree (lockable_type, lockable_id);


--
-- Name: index_locks_on_reader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_locks_on_reader_id ON public.locks USING btree (reader_id);


--
-- Name: index_managerships_on_library_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_managerships_on_library_id ON public.managerships USING btree (library_id);


--
-- Name: index_managerships_on_manager_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_managerships_on_manager_id ON public.managerships USING btree (manager_id);


--
-- Name: index_pages_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_pages_on_case_id ON public.pages USING btree (case_id);


--
-- Name: index_podcasts_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_podcasts_on_case_id ON public.podcasts USING btree (case_id);


--
-- Name: index_questions_on_quiz_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_questions_on_quiz_id ON public.questions USING btree (quiz_id);


--
-- Name: index_quizzes_on_author_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_quizzes_on_author_id ON public.quizzes USING btree (author_id);


--
-- Name: index_quizzes_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_quizzes_on_case_id ON public.quizzes USING btree (case_id);


--
-- Name: index_quizzes_on_lti_uid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_quizzes_on_lti_uid ON public.quizzes USING btree (lti_uid);


--
-- Name: index_quizzes_on_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_quizzes_on_template_id ON public.quizzes USING btree (template_id);


--
-- Name: index_readers_on_active_community_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_readers_on_active_community_id ON public.readers USING btree (active_community_id);


--
-- Name: index_readers_on_confirmation_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_readers_on_confirmation_token ON public.readers USING btree (confirmation_token);


--
-- Name: index_readers_on_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_readers_on_email ON public.readers USING btree (email);


--
-- Name: index_readers_on_reset_password_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_readers_on_reset_password_token ON public.readers USING btree (reset_password_token);


--
-- Name: index_readers_roles_on_reader_id_and_role_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_readers_roles_on_reader_id_and_role_id ON public.readers_roles USING btree (reader_id, role_id);


--
-- Name: index_readers_roles_on_role_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_readers_roles_on_role_id ON public.readers_roles USING btree (role_id);


--
-- Name: index_reading_list_items_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reading_list_items_on_case_id ON public.reading_list_items USING btree (case_id);


--
-- Name: index_reading_list_items_on_reading_list_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reading_list_items_on_reading_list_id ON public.reading_list_items USING btree (reading_list_id);


--
-- Name: index_reading_list_saves_on_reader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reading_list_saves_on_reader_id ON public.reading_list_saves USING btree (reader_id);


--
-- Name: index_reading_list_saves_on_reader_id_and_reading_list_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_reading_list_saves_on_reader_id_and_reading_list_id ON public.reading_list_saves USING btree (reader_id, reading_list_id);


--
-- Name: index_reading_list_saves_on_reading_list_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reading_list_saves_on_reading_list_id ON public.reading_list_saves USING btree (reading_list_id);


--
-- Name: index_reading_lists_on_reader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reading_lists_on_reader_id ON public.reading_lists USING btree (reader_id);


--
-- Name: index_reading_lists_on_uuid; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_reading_lists_on_uuid ON public.reading_lists USING btree (uuid);


--
-- Name: index_reply_notifications_on_reader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reply_notifications_on_reader_id ON public.reply_notifications USING btree (reader_id);


--
-- Name: index_roles_on_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_roles_on_name ON public.roles USING btree (name);


--
-- Name: index_roles_on_name_and_resource_type_and_resource_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_roles_on_name_and_resource_type_and_resource_id ON public.roles USING btree (name, resource_type, resource_id);


--
-- Name: index_spotlight_acknowledgements_on_reader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_spotlight_acknowledgements_on_reader_id ON public.spotlight_acknowledgements USING btree (reader_id);


--
-- Name: index_submissions_on_quiz_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_submissions_on_quiz_id ON public.submissions USING btree (quiz_id);


--
-- Name: index_submissions_on_reader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_submissions_on_reader_id ON public.submissions USING btree (reader_id);


--
-- Name: index_taggings_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_taggings_on_case_id ON public.taggings USING btree (case_id);


--
-- Name: index_taggings_on_case_id_and_tag_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_taggings_on_case_id_and_tag_id ON public.taggings USING btree (case_id, tag_id);


--
-- Name: index_taggings_on_tag_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_taggings_on_tag_id ON public.taggings USING btree (tag_id);


--
-- Name: index_tags_on_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_tags_on_name ON public.tags USING btree (name);


--
-- Name: index_visits_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_visits_on_user_id ON public.visits USING btree (user_id);


--
-- Name: index_visits_on_visit_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_visits_on_visit_token ON public.visits USING btree (visit_token);


--
-- Name: index_wikidata_links_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_wikidata_links_on_case_id ON public.wikidata_links USING btree (case_id);


--
-- Name: index_wikidata_links_on_object_type_and_object_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_wikidata_links_on_object_type_and_object_id ON public.wikidata_links USING btree (object_type, object_id);


--
-- Name: questions fk_rails_0238c45a86; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT fk_rails_0238c45a86 FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id);


--
-- Name: comment_threads fk_rails_0292337bad; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_threads
    ADD CONSTRAINT fk_rails_0292337bad FOREIGN KEY (reader_id) REFERENCES public.readers(id);


--
-- Name: answers fk_rails_03d3a93cfc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT fk_rails_03d3a93cfc FOREIGN KEY (submission_id) REFERENCES public.submissions(id);


--
-- Name: enrollments fk_rails_0411d261ff; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT fk_rails_0411d261ff FOREIGN KEY (case_id) REFERENCES public.cases(id);


--
-- Name: cases fk_rails_04f7dcd821; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT fk_rails_04f7dcd821 FOREIGN KEY (translation_base_id) REFERENCES public.cases(id);


--
-- Name: case_archives fk_rails_0a47f951ed; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_archives
    ADD CONSTRAINT fk_rails_0a47f951ed FOREIGN KEY (case_id) REFERENCES public.cases(id);


--
-- Name: locks fk_rails_18e2ec121a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locks
    ADD CONSTRAINT fk_rails_18e2ec121a FOREIGN KEY (reader_id) REFERENCES public.readers(id);


--
-- Name: case_library_requests fk_rails_1ce2cc5c10; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_library_requests
    ADD CONSTRAINT fk_rails_1ce2cc5c10 FOREIGN KEY (library_id) REFERENCES public.libraries(id);


--
-- Name: managerships fk_rails_3617778c6a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.managerships
    ADD CONSTRAINT fk_rails_3617778c6a FOREIGN KEY (manager_id) REFERENCES public.readers(id);


--
-- Name: submissions fk_rails_369ed4eb5c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT fk_rails_369ed4eb5c FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id);


--
-- Name: enrollments fk_rails_372da43ef7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT fk_rails_372da43ef7 FOREIGN KEY (reader_id) REFERENCES public.readers(id);


--
-- Name: group_memberships fk_rails_3977aa5e44; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_memberships
    ADD CONSTRAINT fk_rails_3977aa5e44 FOREIGN KEY (reader_id) REFERENCES public.readers(id);


--
-- Name: forums fk_rails_3c3d83e003; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forums
    ADD CONSTRAINT fk_rails_3c3d83e003 FOREIGN KEY (community_id) REFERENCES public.communities(id);


--
-- Name: answers fk_rails_3d5ed4418f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT fk_rails_3d5ed4418f FOREIGN KEY (question_id) REFERENCES public.questions(id);


--
-- Name: communities fk_rails_44a9601cb3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communities
    ADD CONSTRAINT fk_rails_44a9601cb3 FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: case_library_requests fk_rails_4b890746d8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_library_requests
    ADD CONSTRAINT fk_rails_4b890746d8 FOREIGN KEY (requester_id) REFERENCES public.readers(id);


--
-- Name: answers fk_rails_4baf2a8f31; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT fk_rails_4baf2a8f31 FOREIGN KEY (reader_id) REFERENCES public.readers(id);


--
-- Name: case_elements fk_rails_5bad37476a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_elements
    ADD CONSTRAINT fk_rails_5bad37476a FOREIGN KEY (case_id) REFERENCES public.cases(id);


--
-- Name: forums fk_rails_5f30e86c8a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forums
    ADD CONSTRAINT fk_rails_5f30e86c8a FOREIGN KEY (case_id) REFERENCES public.cases(id);


--
-- Name: comment_threads fk_rails_640f963830; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_threads
    ADD CONSTRAINT fk_rails_640f963830 FOREIGN KEY (case_id) REFERENCES public.cases(id);


--
-- Name: editorships fk_rails_65154bc221; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.editorships
    ADD CONSTRAINT fk_rails_65154bc221 FOREIGN KEY (editor_id) REFERENCES public.readers(id);


--
-- Name: locks fk_rails_6f28fa384a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locks
    ADD CONSTRAINT fk_rails_6f28fa384a FOREIGN KEY (case_id) REFERENCES public.cases(id);


--
-- Name: comments fk_rails_715847c280; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT fk_rails_715847c280 FOREIGN KEY (reader_id) REFERENCES public.readers(id);


--
-- Name: comment_threads fk_rails_76abda4dc1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_threads
    ADD CONSTRAINT fk_rails_76abda4dc1 FOREIGN KEY (card_id) REFERENCES public.cards(id);


--
-- Name: spotlight_acknowledgements fk_rails_791e6e568c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spotlight_acknowledgements
    ADD CONSTRAINT fk_rails_791e6e568c FOREIGN KEY (reader_id) REFERENCES public.readers(id);


--
-- Name: pages fk_rails_7d36788f66; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT fk_rails_7d36788f66 FOREIGN KEY (case_id) REFERENCES public.cases(id);


--
-- Name: reading_list_items fk_rails_7fe921b5b7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_list_items
    ADD CONSTRAINT fk_rails_7fe921b5b7 FOREIGN KEY (reading_list_id) REFERENCES public.reading_lists(id);


--
-- Name: cards fk_rails_8ed9cff919; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT fk_rails_8ed9cff919 FOREIGN KEY (case_id) REFERENCES public.cases(id);


--
-- Name: taggings fk_rails_8fbac4c978; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taggings
    ADD CONSTRAINT fk_rails_8fbac4c978 FOREIGN KEY (case_id) REFERENCES public.cases(id);


--
-- Name: reading_list_saves fk_rails_916bc40468; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_list_saves
    ADD CONSTRAINT fk_rails_916bc40468 FOREIGN KEY (reader_id) REFERENCES public.readers(id);


--
-- Name: managerships fk_rails_98339b9ce3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.managerships
    ADD CONSTRAINT fk_rails_98339b9ce3 FOREIGN KEY (library_id) REFERENCES public.libraries(id);


--
-- Name: taggings fk_rails_9fcd2e236b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taggings
    ADD CONSTRAINT fk_rails_9fcd2e236b FOREIGN KEY (tag_id) REFERENCES public.tags(id);


--
-- Name: comments fk_rails_a5d70e6445; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT fk_rails_a5d70e6445 FOREIGN KEY (comment_thread_id) REFERENCES public.comment_threads(id);


--
-- Name: comment_threads fk_rails_a6949c9b94; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_threads
    ADD CONSTRAINT fk_rails_a6949c9b94 FOREIGN KEY (forum_id) REFERENCES public.forums(id);


--
-- Name: answers fk_rails_b35896c4ab; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT fk_rails_b35896c4ab FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id);


--
-- Name: invitations fk_rails_ba4300c36f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT fk_rails_ba4300c36f FOREIGN KEY (reader_id) REFERENCES public.readers(id);


--
-- Name: quizzes fk_rails_c22feaf615; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT fk_rails_c22feaf615 FOREIGN KEY (case_id) REFERENCES public.cases(id);


--
-- Name: active_storage_attachments fk_rails_c3b3935057; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_attachments
    ADD CONSTRAINT fk_rails_c3b3935057 FOREIGN KEY (blob_id) REFERENCES public.active_storage_blobs(id);


--
-- Name: reading_lists fk_rails_c5ca6ed199; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_lists
    ADD CONSTRAINT fk_rails_c5ca6ed199 FOREIGN KEY (reader_id) REFERENCES public.readers(id);


--
-- Name: cards fk_rails_c5d03ef31a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT fk_rails_c5d03ef31a FOREIGN KEY (page_id) REFERENCES public.pages(id);


--
-- Name: invitations fk_rails_c70c9be1c0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT fk_rails_c70c9be1c0 FOREIGN KEY (community_id) REFERENCES public.communities(id);


--
-- Name: deployments fk_rails_c7885b3f7b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deployments
    ADD CONSTRAINT fk_rails_c7885b3f7b FOREIGN KEY (case_id) REFERENCES public.cases(id);


--
-- Name: edgenotes fk_rails_cb36917c96; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edgenotes
    ADD CONSTRAINT fk_rails_cb36917c96 FOREIGN KEY (card_id) REFERENCES public.cards(id);


--
-- Name: editorships fk_rails_cdd20e6a1b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.editorships
    ADD CONSTRAINT fk_rails_cdd20e6a1b FOREIGN KEY (case_id) REFERENCES public.cases(id);


--
-- Name: case_library_requests fk_rails_d03a43e779; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_library_requests
    ADD CONSTRAINT fk_rails_d03a43e779 FOREIGN KEY (case_id) REFERENCES public.cases(id);


--
-- Name: group_memberships fk_rails_d05778f88b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_memberships
    ADD CONSTRAINT fk_rails_d05778f88b FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: deployments fk_rails_d4d9e0a1aa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deployments
    ADD CONSTRAINT fk_rails_d4d9e0a1aa FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id);


--
-- Name: podcasts fk_rails_e228f9f051; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcasts
    ADD CONSTRAINT fk_rails_e228f9f051 FOREIGN KEY (case_id) REFERENCES public.cases(id);


--
-- Name: reading_list_saves fk_rails_e9316a2e94; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_list_saves
    ADD CONSTRAINT fk_rails_e9316a2e94 FOREIGN KEY (reading_list_id) REFERENCES public.reading_lists(id);


--
-- Name: submissions fk_rails_ea35513632; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT fk_rails_ea35513632 FOREIGN KEY (reader_id) REFERENCES public.readers(id);


--
-- Name: reading_list_items fk_rails_efeaa2af93; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_list_items
    ADD CONSTRAINT fk_rails_efeaa2af93 FOREIGN KEY (case_id) REFERENCES public.cases(id);


--
-- Name: deployments fk_rails_f49860c54d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deployments
    ADD CONSTRAINT fk_rails_f49860c54d FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: readers fk_rails_fc0d035c15; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.readers
    ADD CONSTRAINT fk_rails_fc0d035c15 FOREIGN KEY (active_community_id) REFERENCES public.communities(id);


--
-- PostgreSQL database dump complete
--

SET search_path TO "$user", public;

INSERT INTO "schema_migrations" (version) VALUES
('20160511194730'),
('20160511203111'),
('20160516145146'),
('20160516153452'),
('20160516153854'),
('20160516155813'),
('20160518190159'),
('20160518190257'),
('20160518190358'),
('20160518192901'),
('20160518200132'),
('20160609160112'),
('20160622194431'),
('20160623134628'),
('20160630171433'),
('20160701213227'),
('20160709160633'),
('20160720200457'),
('20160720200605'),
('20160720200640'),
('20160720202753'),
('20160721182654'),
('20160727194935'),
('20160810151157'),
('20160822194345'),
('20160901142137'),
('20160909151439'),
('20160909214924'),
('20160909215200'),
('20160909215300'),
('20161011183205'),
('20161011183206'),
('20161208171215'),
('20170124223148'),
('20170202221710'),
('20170202221811'),
('20170216193541'),
('20170306195553'),
('20170309181755'),
('20170315154030'),
('20170315190528'),
('20170321155446'),
('20170321164420'),
('20170412173537'),
('20170412175954'),
('20170419172037'),
('20170420172635'),
('20170426200309'),
('20170501193920'),
('20170501221658'),
('20170511212540'),
('20170705153826'),
('20170705164751'),
('20170705165135'),
('20170706155100'),
('20170707160226'),
('20170719190445'),
('20170721144836'),
('20170808143515'),
('20170808143606'),
('20170808150850'),
('20170809151238'),
('20170809153905'),
('20170809171600'),
('20170830013418'),
('20170830201129'),
('20170908211738'),
('20170921172025'),
('20171023182346'),
('20171024180715'),
('20171025205053'),
('20171030185254'),
('20171031161433'),
('20171113192541'),
('20171220165301'),
('20180119170858'),
('20180129143420'),
('20180206151601'),
('20180212172121'),
('20180219152023'),
('20180220162824'),
('20180221153559'),
('20180321161907'),
('20180405141157'),
('20180405181811'),
('20180423145615'),
('20180502185535'),
('20180518184926'),
('20180525133320'),
('20180529153730'),
('20180627142157'),
('20180627142644'),
('20180725173214'),
('20180806201126'),
('20180806201127'),
('20180824210458'),
('20180827153920'),
('20180828192116'),
('20180911154308'),
('20180911155612'),
('20180919145935'),
('20181029165916'),
('20181030194657'),
('20181108181434'),
('20190219154939'),
('20190222195858'),
('20190319130136'),
('20190320160900'),
('20190320215448'),
('20190402133633'),
('20190402133819'),
('20190405162440'),
('20190422154229'),
('20190423195511'),
('20190423203000'),
('20190424134031'),
('20190501151722'),
('20190514190157'),
('20230412003331'),
('20230830042848'),
('20230915154708'),
('20231011161246'),
('20241011080359'),
('20241120211444');


