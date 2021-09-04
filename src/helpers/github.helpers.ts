import {Octokit} from '@octokit/core';

const octokit = new Octokit();

export type IGithubAsset = {
    url: string;
    browser_download_url: string;
    id: number;
    node_id: string;
    name: string;
    state: string;
    content_type: string;
    size: number;
    download_count: number;
    created_at: string;
    updated_at: string;
    uploader: any;
}

export type IGithubRelease = {
    url: string;
    html_url: string;
    assets_url: string;
    upload_url: string;
    tarball_url: string;
    zipball_url: string;
    id: number;
    node_id: string;
    tag_name: string;
    target_commitish: string;
    name: string;
    body: string;
    draft: boolean;
    prerelease: boolean;
    created_at: string;
    published_at: string;
    author: any;
    assets: IGithubAsset[];
};

export function getAssetUrl(release: IGithubRelease, name: string): string | null {
    const asset = release.assets.find(a => a.name == name);

    if (asset == undefined) {
        return null;
    }

    return asset.browser_download_url;
}

export async function getRelease(owner: string, repo: string, branch: string): Promise<IGithubRelease | string> {
    try {
        const releases = await octokit.request('GET /repos/{owner}/{repo}/releases', {
            owner,
            repo
        });

        if (releases == undefined || !(releases.data instanceof Array)) {
            return "Could not find repo";
        }

        const release = (releases.data as IGithubRelease[])
            .filter((r): boolean => r.tag_name.includes(branch))
            .sort((a, b): number => Number(new Date(a.published_at)) - Number(new Date(b.published_at)))[0];

        if (release == undefined) {
            return "Could not find release for current branch";
        }

        return release;
    } catch (e) {
        console.log(e)
        return "Could not get github release";
    }
}